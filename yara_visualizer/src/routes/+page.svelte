<script lang="ts">
    import { Button, Card, CardBody, CardFooter, Col, Container, FormGroup, FormText, Input, Label, Row, Styles, Spinner } from 'sveltestrap';
    import { _sendData, _highlightInstances, _highlightWordByOffset, _getFormattedData } from '$lib/utils';
    import { _encodings, _preProcessMatch } from './+page';
    import { page } from '$app/stores';
    import { rulesTextArea, dataTextArea, theme } from '$lib/stores';
    import { Utils } from 'dumbo-svelte/utils'
    import { get } from 'svelte/store';
    import { onMount } from 'svelte';
    import EncodingsTable from '../components/encodings-table.svelte';
    import type { HighlightedMatches, JsonRequest, JsonResponse, State } from '../model/model';
    import MatchingTable from '../components/matching-table.svelte';
    import { draw, fade, fly, slide } from 'svelte/transition';
    import { linear } from 'svelte/easing';

    onMount(async () => {
        document.getElementsByTagName("body")[0].setAttribute("data-load", "complete");
    });
    let dataFiles: FileList;
    let rulesFiles: FileList;
    let completeScan: boolean = false;
    let renderTable: boolean = false;
    let loadingResponse: boolean = false;
    let loadingFile: boolean = false;

    let options = {duration: 300, easing: linear};

    let matches: JsonResponse
    let highlightedText: Map<string, HighlightedMatches>

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
                loadingFile = false;
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
                else{
                    alert("File extension not supported");
                    loadingFile = false;
                }
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
                loadingFile = false;
            };
        }
    }

    $: {
        const data = $dataTextArea;
        const rules = $rulesTextArea;
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
            if(!response.message){
                matches = response
                highlightedText = _preProcessMatch(matches);
                console.log(response);
                setTimeout(() => {
                    loadingResponse = false;
                    renderTable = true;
                }, 400);
            }else{
                    setTimeout(() => {
                loadingResponse = false;
                alert(response.message);
            }, 0);
            }
        }
        , (error) => {
        setTimeout(() => {
            loadingResponse = false;
            alert("Server unreachable");
        }, 0);
        });

    }
</script>

<body>

<Styles />

{#if loadingFile}
    <div class="overlay">
        <Spinner type="grow" style="backgroundColor: #bc66f2;" />
    </div>
{/if}

<div in:slide|global={{...options, duration: 400, axis:"y", delay: 100}} out:slide|global={{...options, axis:"y"}}>
<Card class="mx-auto" style="border-radius: 0; background-color: var(--color-verylight); transition: background-color 500ms ease;">
    <CardBody>
        <Row cols={2}>
            <Container style="background-color: var(--color-verylight); min-width:300pt; padding-right:40pt; padding-left:40pt; transition: background-color 500ms ease">
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
        <Col sm={{ size: 'auto'}} class="zoom-hover">
            <Button style="width: 130pt; color: var(--color-lightest); background-color: var(--color-strongest)" on:click={scanData}>Scan</Button>
        </Col>
    </div>
    </Row>
</CardFooter>
</Card>
</div>
{#if loadingResponse}
<div class="spinner-load">
    <Spinner type="grow" style="background-color: #bc66f2;" />
</div>
{/if}
{#if renderTable}
<div in:slide|global={{...options, duration: 500, axis:"y", delay: 0}} out:slide|global={{...options, axis:"y"}}>
    <Container>
        
        <EncodingsTable {highlightedText} {matches} />
        
        <h3>Match Details</h3>
        
        <MatchingTable {matches} />
        
    </Container>
</div>
{/if}
</body>

<style>

body {
    transition: all 0.5s ease;
}
    .centered {
        display: flex;
        justify-content: center;
        align-items: center;
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