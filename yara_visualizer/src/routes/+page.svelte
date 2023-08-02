<script lang="ts">
    import { Button, ButtonGroup, ButtonToolbar, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, FormGroup, FormText, Input, Label, Row, Styles, Spinner, Table } from 'sveltestrap';
    import type { Color } from 'sveltestrap/src/shared';
    import { _sendData, _highlightInstances, _highlightWordByOffset, _getFormattedData } from './+page';
    import { type JsonRequest, type JsonResponse, type HighlightedMatches, Encoding, type MatchingOccurrence, type State } from '../model/model';
    import { page } from '$app/stores';
    import { rulesTextArea, dataTextArea } from '$lib/stores';
    import { Utils } from 'dumbo-svelte/utils'
    import { get } from 'svelte/store';
    import { onMount } from 'svelte';



    onMount(async () => {
        document.getElementsByTagName("body")[0].setAttribute("data-load", "complete");
    });

    const color: Color = 'dark';
    let dataFiles: FileList;
    let rulesFiles: FileList;
    let completeScan: boolean = false;
    let renderTable: boolean = false;
    let loadingResponse: boolean = false;
    let loadingFile: boolean = false;

    $: if(dataFiles){
        let result: string  = '';
        loadingFile = true;
        for(const file of dataFiles){
            
            let reader= new FileReader();
    
            if (file.type != "text/plain")
                reader.readAsBinaryString(file)
            else
                reader.readAsText(file);
            
            reader.onload = function(){
                setTimeout(() => {
                    result = reader.result?.slice(0) as string;
                    dataTextArea.set(result);
                    loadingFile = false;
                },10);
            };

            reader.onerror = function() {
                console.log(reader.error);
            };
        }
                
    }

    $: if(rulesFiles) {
        let result: string  = '';
        loadingFile = true;
        for(const file of rulesFiles){
            
            let reader= new FileReader();
    
            if (file.type != "text/plain"){
                if((file.name.endsWith(".yar")) || file.name.endsWith(".yara"))
                    reader.readAsBinaryString(file)
                else
                    alert("File extension not supported");
            }
            else
                reader.readAsText(file);
            
            reader.onload = function(){
                setTimeout(() => {
                    result = reader.result?.slice(0) as string;
                    rulesTextArea.set(result);
                    loadingFile = false;
                },10);
            };

            reader.onerror = function() {
                console.log(reader.error);
            };
        }
    }

    $: {
        const data = get(dataTextArea);
        const rules = get(rulesTextArea);
        if (typeof window !== 'undefined') {
            updateUrlHash(data, rules);
        }
    }


    function updateUrlHash(data:string, rules:string) {
        const hashString = Utils.compress({rules: rules, data: data});
        if (typeof window !== 'undefined') {
            window.location.hash = '#state='+hashString;
        }
    }
    const matchUrl = $page.url.hash.match(/#state=(.*)/);
    if (matchUrl) {
        const state: State = Utils.uncompress(matchUrl[1]);
        rulesTextArea.set(state.rules);
        dataTextArea.set(state.data);
    }


    let encodings: Encoding[] = [Encoding.HEX, Encoding.ASCII, Encoding.PLAIN, Encoding.UTF8, Encoding.UTF16, Encoding.UTF32, Encoding.BINARY];



    let matches: JsonResponse
    let highlightedText: Map<string, HighlightedMatches>

    
    function scanData() {
        loadingResponse = true;
        renderTable = false;
        let jsonRequest: JsonRequest = {
            rules: get(rulesTextArea),
            data: get(dataTextArea),
            complete_scan: completeScan
        };

        console.log(jsonRequest);
        
        _sendData(jsonRequest).then((response) => {
            matches = response
            highlightedText = preProcessMatch(matches);
            console.log(response);
            setTimeout(() => {
                loadingResponse = false;
                renderTable = true;
            }, 0);
        }
        , (error) => {
        console.log(error);
        setTimeout(() => {
            loadingResponse = false;
            alert("Server unreachable");
        }, 0);
        });

    }

    //this function is used to pre-process the matches in order to highlight the matched data
    function preProcessMatch(matches: JsonResponse): Map<string, HighlightedMatches > {
        let matchOccurences: MatchingOccurrence[] = [];
        let rules: string[] = [];
        
        let highlightedTextMap: Map<string, HighlightedMatches> = new Map<string, HighlightedMatches >();
        matches.matches.forEach((match) => {
            rules.push(match.rule);
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
                highlightedTextMap.set(encodings[encoding], {rules: rules, highlighted_string: _highlightInstances(get(dataTextArea), matchOccurences, encodings[encoding])});
            }else
            {
                highlightedTextMap.set(encodings[encoding], {rules: undefined , highlighted_string: "No matched data" });
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
                        <Input type="textarea" name="text" id="rulesTextArea" bind:value={$rulesTextArea} 
                        style="background-color: var(--color-text-area); min-height:100pt; max-height:400pt"/>
                    </FormGroup>
                    <div class="options">
                        <FormGroup>
                            <Label for="rulesFile">or upload your rules here</Label>
                            <Input bind:files={rulesFiles} type="file" name="file" id="rulesFile" accept=".txt,.yar,.yara"
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
                        <Input type="textarea" name="text" id="dataTextArea" bind:value={$dataTextArea} 
                        style="background-color: var(--color-text-area); min-height:100pt; max-height:400pt;"/>
                    </FormGroup>
                    <div class="options">
                        <FormGroup>
                            <Label for="dataFile">or upload your file to scan here</Label>
                            <Input bind:files={dataFiles} type="file" name="file" id="dataFile" alt="dataInput" 
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
<div id= "table-results" class="options">
    <Table disabled={loadingResponse}>
        <thead>
            <tr>
                <th>Encoding</th>
                <th>Data</th>
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
            </tr>
            {/each}
        </tbody>
    </Table>
    
    <Table disabled={loadingResponse}>
        <thead>
            <tr>
                <th>Matched rules</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="overflow: auto; max-width: 20vw; max-height: 40vh;">
                    {#each matches.matches || [] as rule}
                        <p>{rule.rule}</p>
                    {/each}
                </td>
            </tr>
        </tbody>
    </Table>
</div>
<h3>Match Details</h3>
<div class="options">
    <Table disabled={loadingResponse}>
        <thead>
            <tr>
                <th>Rules</th>
                <th>Matches</th>
            </tr>
        </thead>
        <tbody>
            {#each matches.matches || [] as rule}
            <tr>
                    <td>
                        <pre style="max-width: 20vw; overflow: auto;  white-space:pre-wrap; max-height: 200px;">
{rule.rule}
{_getFormattedData(JSON.parse(rule.meta.replace(/'/g, '\"')))}
                        </pre>
                    </td>
                
                    <td>
                        <div class="scrollable-content-spaces">
                        {#each rule.string_match || [] as stringMatch}
                            {#each stringMatch.instances || [] as instance}
                                <p> Offset: {instance.offset} -- Length: {instance.matched_length} -- Matched data: "{instance.matched_data}"</p>
                            {/each}
                        {/each}
                        </div>
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
        display: flex;
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