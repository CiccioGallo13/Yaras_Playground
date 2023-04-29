<script lang="ts">
    import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, FormGroup, FormText, Input, Label, Row, Styles } from 'sveltestrap';
    import type { Color } from 'sveltestrap/src/shared';
    import type { JsonRequest } from './+page';
    import sendData from './+page';

    const color: Color = 'dark';

    let files: FileList;
    let dataTextArea: string;
    let rulesTextArea: string;
    function fileScan(who: string): any{
        var result: string  = '';
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
    }

    let matches = []
    
    async function scanData() {
        let jsonRequest: JsonRequest = {
            rules: rulesTextArea,
            data: dataTextArea,
            complete_scan: false
        }
        
        sendData(jsonRequest).then((response) => {
            matches = response.matches;
            console.log(matches);
        
        }
        , (error) => {
        console.log(error);
        });
    
    }
</script>

<Styles />

<Card class="mx-auto" style="border-radius: 0;">
    <CardHeader>
        <CardTitle style="text-align: center;">YARA VISUALIZER</CardTitle>
    </CardHeader>
    <CardBody>
        <Row cols={2}>
            <Container>
                <Col sm={{ size: 'auto', offset: 1 }}>
                    <FormGroup>
                        <Label for="rulesTextArea">Rules</Label>
                        <Input type="textarea" name="text" id="rulesTextArea" bind:value={rulesTextArea} style="min-height:100pt; max-height:400pt"/>
                    </FormGroup>
                    <div class="options">
                        <FormGroup>
                            <Label for="rulesFile">or upload your rules here</Label>
                            <Input bind:files type="file" name="file" id="rulesFile" on:change={() => fileScan("rules")}/>
                            <FormText color="muted" />
                        </FormGroup>

                    </div>

                </Col>
            </Container>

            <Container>
                <Col sm={{ size: 'auto', offset: 1}}>
                    <FormGroup>
                        <Label for="dataTextArea">Data</Label>
                        <Input type="textarea" name="text" id="dataTextArea" bind:value={dataTextArea} style="min-height:100pt; max-height:400pt"/>
                    </FormGroup>
                    <div class="options">
                        <FormGroup>
                            <Label for="dataFile">or upload your file to scan here</Label>
                            <Input bind:files type="file" name="file" id="dataFile" on:input={() => fileScan("data")} />
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
                <Input id="completeScanCheckBox" type="checkbox" label="Complete scan" />
            </FormGroup>
        </Col>
    </div>
    
    <div class="centered">
        <Col sm={{ size: 'auto'}}>
            <Button {color} style="width: 130pt" on:click={scanData}>Scan</Button>
        </Col>
    </div>
</Row>
</CardFooter>

</Card>

<style>

    .options {
        padding-top: 0.6cm;
    }

    .centered {
        display: flex;
        justify-content: center;
        align-items: center;
}


</style>