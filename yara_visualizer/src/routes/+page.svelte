<script lang="ts">
    import { Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, FormGroup, FormText, Input, Label, Row, Styles, Spinner, Table } from 'sveltestrap';
    import type { Color } from 'sveltestrap/src/shared';
    import { _sendData, _encodeString } from './+page';
    import type { JsonRequest, JsonResponse, HighlightedMatches } from '../model/model';
    import { _highlightWordByOffset } from './+page';


    const color: Color = 'dark';
    let files: FileList;
    let dataTextArea: string;
    let rulesTextArea: string;
    let completeScan: boolean = false;
    let renderTable: boolean = false;
    let loadingResponse: boolean = false;
    let loadingFile: boolean = false;

    function fileScan(who: string): any{
        var result: string  = '';
        loadingFile = true;
        setTimeout(() => {
            if(files){ 
                for(const file of files){
                    
                    let reader= new FileReader();
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
        },150);


    }

    let matches: JsonResponse
    let higlightedText: Map<string, HighlightedMatches[]>

    
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
            higlightedText = preProcessMatch(matches);
            console.log(response);
            renderTable = true;
            loadingResponse = false;
    
        }
        , (error) => {
        console.log(error);
        });

    }

    
    function preProcessMatch(matches: JsonResponse): Map<string, HighlightedMatches[] > {
        let highlightedTextMap: Map<string, HighlightedMatches[]> = new Map<string, HighlightedMatches[] >();

        matches.encoding_matches.forEach((element) => {
            let highlightedMatches: HighlightedMatches[] = [];
            element.matches.forEach((match) => {
                
                let highlighted: string = _encodeString(dataTextArea, element.encoding);
                let offsetDiff = 0;
            match.string_match.forEach((stringMatch) => {
                stringMatch.instances.forEach((instance) => {
                const highlightedInstance = _highlightWordByOffset(
                    highlighted,
                    instance.offset + offsetDiff,
                    instance.matched_length
                );
                highlighted = highlightedInstance;
                offsetDiff += 13;
                });
                highlightedMatches.push({
                rule: match.rule,
                meta: match.meta,
                highlighted_string: highlighted,
                });
            });
            });
            if( highlightedMatches.length != 0 ){
                highlightedTextMap.set(element.encoding, highlightedMatches);
            }else
            {
                highlightedTextMap.set(element.encoding, new Array<HighlightedMatches>( {rule: undefined, meta: undefined, highlighted_string: "No matched data"} )  );
            }
        });

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
                        <Input type="textarea" name="text" id="rulesTextArea" bind:value={rulesTextArea} 
                        style="background-color: var(--color-text-area); min-height:100pt; max-height:400pt"/>
                    </FormGroup>
                    <div class="options">
                        <FormGroup>
                            <Label for="rulesFile">or upload your rules here</Label>
                            <Input bind:files type="file" name="file" id="rulesFile" on:change={() => fileScan("rules")}
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
                        <Input type="textarea" name="text" id="dataTextArea" bind:value={dataTextArea} 
                        style="background-color: var(--color-text-area); min-height:100pt; max-height:400pt;"/>
                    </FormGroup>
                    <div class="options">
                        <FormGroup>
                            <Label for="dataFile">or upload your file to scan here</Label>
                            <Input bind:files type="file" name="file" id="dataFile" on:change={() => fileScan("data")}
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
        {#each matches.encoding_matches as _match}
        <tr>
            <td>{_match.encoding}</td>
            <td>
                <div class="scrollable-content">
                {#each higlightedText.get(_match.encoding) || [] as highlightedMatch}
                    <p>{@html highlightedMatch.highlighted_string}</p>
                {/each}
                </div>
            </td>
            <td>
                {#each _match.matches as dataMatch}
                    <p>{dataMatch.rule}</p>
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
    .scrollable-content {
        max-width: 900px;
        word-wrap: break-word;
        max-height: 200px;
        overflow-y: auto;
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