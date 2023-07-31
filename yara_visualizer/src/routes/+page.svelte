<script lang="ts">
    import { Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, FormGroup, FormText, Input, Label, Row, Styles, Spinner, Table } from 'sveltestrap';
    import type { Color } from 'sveltestrap/src/shared';
    import { _sendData, _encodeString, _highlightInstances } from './+page';
    import { type JsonRequest, type JsonResponse, type HighlightedMatches, Encoding, type MatchingOccurrence } from '../model/model';
    import { _highlightWordByOffset } from './+page';


    const color: Color = 'dark';
    let files: FileList;
    let dataTextArea: string;
    let rulesTextArea: string;
    let completeScan: boolean = false;
    let renderTable: boolean = false;
    let loadingResponse: boolean = false;
    let loadingFile: boolean = false;

    let encodings: Encoding[] = [Encoding.HEX, Encoding.ASCII, Encoding.UTF8, Encoding.UTF16, Encoding.UTF32, Encoding.BINARY];


    function fileScan(who: string): any{
        var result: string  = '';
        loadingFile = true;
        setTimeout(() => {
            if(files){ 
                for(const file of files){
                    
                    let reader= new FileReader();
            
                    if (file.type != "text/plain"){
                        if(who === "data" || (who === "rules" && (file.name.endsWith(".yar")) || file.name.endsWith(".yara"))){
                            reader.readAsBinaryString(file)
                        }else{
                            alert("File extension not supported");
                        }
                    }
                    else
                        reader.readAsText(file);
                    
                    reader.onload = function(){
                        //console.log(reader.result); 
                        result = reader.result?.slice(0) as string;
                        if(who === "data"){
                            console.log(result);
                            dataTextArea= result;
                        }else{
                            if(who === "rules")
                            {
                                rulesTextArea = result;
                            }
                        }
                    };


                    reader.onerror = function() {
                        console.log(reader.error);
                    };
                }
                
            }
            loadingFile = false;
        },300);

    }

    let matches: JsonResponse
    let highlightedText: Map<string, HighlightedMatches>

    
    async function scanData() {
        loadingResponse = true;
        renderTable = false;
        let jsonRequest: JsonRequest = {
            rules: rulesTextArea,
            data: dataTextArea,
            complete_scan: completeScan
        };

        console.log(jsonRequest);
        
        _sendData(jsonRequest).then((response) => {
            matches = response
            highlightedText = preProcessMatch(matches);
            console.log(response);
            renderTable = true;
            loadingResponse = false;
    
        }
        , (error) => {
        console.log(error);
        loadingResponse = false;
        alert("Server unreachable");
        });

    }

    //this function is used to pre-process the matches in order to highlight the matched data
    function preProcessMatch(matches: JsonResponse): Map<string, HighlightedMatches > {
        let matchOccurences: MatchingOccurrence[] = [];
        let rules: string[] = [];
        let meta: string[] = [];
        
        let highlightedTextMap: Map<string, HighlightedMatches> = new Map<string, HighlightedMatches >();
        matches.matches.forEach((match) => {
            rules.push(match.rule);
            meta.push(match.meta);
            match.string_match.forEach((stringMatch) => {
                stringMatch.instances.forEach((instance) => {
                    matchOccurences.push({
                        offset: instance.offset,
                        length: instance.matched_length
                    });
                });
            });
        });
        for(let encoding in encodings) {

            if( rules.length != 0 ){
                highlightedTextMap.set(encodings[encoding], {rules: rules , meta: meta, highlighted_string: _highlightInstances(dataTextArea, matchOccurences, encodings[encoding])});
            }else
            {
                highlightedTextMap.set(encodings[encoding], {rules: undefined , meta: undefined, highlighted_string: "No matched data" });
            }
        };

        return highlightedTextMap;
    }

</script>

<body>

<Styles />

{#if loadingFile}
    <div class="overlay">
        <Spinner type="grow" style="backgroundColor: #bc66f2;" />
    </div>
{/if}

<Card class="mx-auto" style="border-radius: 0; background-color: var(--color-verylight)">
    <CardBody>
        <Row cols={2}>
            <Container style="background-color: var(--color-verylight); min-width:300pt; padding-right:40pt; padding-left:40pt;">
                <Col sm={{ size: 'auto', offset: 0 }}>
                    <FormGroup>
                        <Label for="rulesTextArea">Rules</Label>
                        <Input type="textarea" name="text" id="rulesTextArea" alt="rulesTextArea" bind:value={rulesTextArea} 
                        style="background-color: var(--color-text-area); min-height:100pt; max-height:400pt"/>
                    </FormGroup>
                    <div class="options">
                        <FormGroup>
                            <Label for="rulesFile">or upload your rules here</Label>
                            <Input bind:files type="file" name="file" id="rulesFile" alt="rulesInput" accept=".txt,.yar,.yara" on:change={() => fileScan("rules")}
                                style="background-color: var(--color-text-area);"/>
                            <FormText color="muted" />
                        </FormGroup>

                    </div>

                </Col>
            </Container>
        

            <Container style="padding-right: 40pt; padding-left: 40pt; min-width:300pt;">
                <Col sm={{ size: 'auto', offset: 0}}>
                    <FormGroup>
                        <Label for="dataTextArea">Data</Label>
                        <Input type="textarea" name="text" id="dataTextArea" alt="dataTextArea" bind:value={dataTextArea} 
                        style="background-color: var(--color-text-area); min-height:100pt; max-height:400pt;"/>
                    </FormGroup>
                    <div class="options">
                        <FormGroup>
                            <Label for="dataFile">or upload your file to scan here</Label>
                            <Input bind:files type="file" name="file" id="dataFile" alt="dataInput" on:change={() => fileScan("data")}
                                style="background-color: var(--color-text-area);"/>
                            <FormText color="muted" />
                        </FormGroup>
                    </div>
                </Col>
            </Container>

        </Row>
    </CardBody>
    
    <CardFooter>
    <Row cols={1}>
    <div class="centered" style="padding-top: 0cm;">
        <Col sm={{ size: 'auto'}}>
            <FormGroup>
                <Input id="completeScanCheckBox" type="checkbox" bind:checked={completeScan} label="Complete scan" />
            </FormGroup>
        </Col>
    </div>
    
    <div class="centered">
        <Col sm={{ size: 'auto'}}>
            <Button style="width: 130pt; color: var(--color-lightest); background-color: var(--color-strongest)" on:click={scanData}>Scan</Button>
        </Col>
    </div>
    </Row>
</CardFooter>
</Card>
{#if loadingResponse}
<div class="spinner-load">
    <Spinner type="grow" style="background-color: #bc66f2;" />
</div>
{/if}
{#if renderTable}
<Container>
<div class="options">
<Table disabled={loadingResponse}>

    <thead>
        <tr>
            <th>Encoding</th>
            <th>Data</th>
            <th>Matched rules</th>
        </tr>
    </thead>
    <tbody>
        {#each encodings as encoding}
        <tr>
            <td>{encoding}</td>
            <td>
                <div>
                    {#if encoding === 'hex' || encoding === 'binary' || encoding === 'ascii'}
                        <pre class="scrollable-content-spaces">{@html highlightedText.get(encoding)?.highlighted_string}</pre>
                    {:else}
                        <pre class="scrollable-content-nospaces">{@html highlightedText.get(encoding)?.highlighted_string}</pre>
                    {/if}
                </div>
            </td>
            <td>
                {#each highlightedText.get(encoding)?.rules || [] as rule}
                    <p>{rule}</p>
                {/each}
            </td>
        </tr>
        {/each}
    </tbody>
</Table>
</div>
</Container>
{/if}
</body>

<style>
    .options {
        padding-top: 0.6cm;
        z-index: 1;
    }
    .centered {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .scrollable-content-spaces {
        overflow-y: auto;
        width: 780px;
        white-space: pre-wrap;
        max-height: 200px;
    }

    .scrollable-content-nospaces {
        overflow-y: auto;
        width: 780px;
        line-break: anywhere;
        white-space: pre-wrap;
        max-height: 200px;
    }

    body {
    background-color: var(--color-verylight);
    color: var(--color-strongest);
    }

    th {
        color: var(--color-strongest);
    }

    td {
        color: var(--color-strongest);
    }

    .spinner-load {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
        z-index: 2;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

</style>