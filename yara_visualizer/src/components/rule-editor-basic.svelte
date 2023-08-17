<script lang="ts">
import type { GenericOperation } from "../model/model";
    import { Styles, Input, Button, Alert, Icon, Toast, ToastHeader, ToastBody } from "sveltestrap";
    import { copyText } from "svelte-copy";
    import { metaInfo } from "./constants";
    import type { Color } from "sveltestrap/src/shared";

    let alertColor: Color = "success";
    let alertMessage: string = "Copied to clipboard";
    let alertOpen: boolean = false;
    let toastOpen: boolean = false;
    let toastHeader: string = "";
    let toastBody: string = "";


    let ruleName: string = "rule_name";
    let meta: GenericOperation[] = [];
    let strings: GenericOperation[] = [];
    let condition: string[] = [""];
    let condtionOperator: string[] = [];
    const openCurly = "{";
    const closeCurly = "}";

    function toggle() {
        toastOpen = !toastOpen;
    }

    function removeElement<T>(whichArray: string, indexToRemove: number) {
        switch(whichArray) {
            case "meta":
                meta = meta.filter((_, index) => index != indexToRemove);
                break;
            case "strings":
                strings = strings.filter((_, index) => index != indexToRemove);
                break;
            case "condition":
                condition = condition.filter((_, index) => index != condtionOperator.length-1);
                condtionOperator = condtionOperator.filter((_, index) => index != condtionOperator.length-1);
                break;
        }
    }

    function copyToClipboard() {
        let invalid = false;
        condtionOperator.forEach(element => {
            if(element != "and" && element != "or") {
                alertColor = "danger";
                alertMessage = "Invalid condition operator";
                alertOpen = true;
                invalid = true;
                return;
            }
            
        });

        condition.forEach(element => {
            if(!element.startsWith("$")) {
                alertColor = "danger";
                alertMessage = "Select a variable for condition";
                alertOpen = true;
                invalid = true;
                return;
            }
        });

        strings.forEach(element => {
            if(condition.filter(x => x == "$"+element.left).length == 0) {
                alertColor = "danger";
                alertMessage = "Unused variable $"+element.left+" in condition";
                alertOpen = true;
                invalid = true;
                return;
            }
        });

        if(invalid) {
            return;
        }
        alertColor = "success";
        alertMessage = "Rule copied to clipboard";
        alertOpen = true;
        copyText(getStringRule());
    }

    function getStringRule() {
        
        let rule = "";
        rule += "rule "+ ruleName + ":\n{";
        rule += "    meta:\n";
        for (let _meta of meta) {
            rule += "        " + _meta.left + " " + _meta.operator + " " + _meta.right + "\n";
        }
        rule += "    strings:\n";
        for (let _string of strings) {
            rule += "        " +"$"+_string.left + " " + _string.operator + " " + _string.right + "\n";
        }
        rule += "    condition:\n";
        for (let i = 0; i < condition.length-1; i++) {
            rule += "        " +condition[i] + " " + condtionOperator[i] + "\n";
        }
        rule += "        " + condition[condition.length-1] + "\n}";
        console.log(rule)
        return rule;
    }

</script>

<Styles />

{#if toastOpen}
<div class="overlay">
    <Toast isOpen={toastOpen} style="position: relative; background-color: gray; ">
        <ToastHeader toggle={toggle}>
            {toastHeader}
        </ToastHeader>
        <ToastBody>
            {toastBody}
        </ToastBody>
    </Toast>
</div>
{/if}

<div class="rule">
    <div class="rule-name">
        rule <input type="text" bind:value={ruleName} />
    </div>
    <div>{openCurly}</div>


    <div class="block">
            meta:<Button color="warning" on:click={() => {toastHeader = "Metadata"; toastBody = metaInfo; toggle()}}
            style="width:25px; height:25px; border-radius: 20px; display:inline-flex; align-items: center; justify-content: center; font-weight:500; margin-left:50px;">i</Button>
        {#each meta as _meta, i}
            <div class="instance">
                <div class="meta-name">
                    <Input style="height:30px;" type="text" bind:value={_meta.left} />
                </div>
                <div class="operator">
                    {_meta.operator}
                </div>
                <div class="value">
                    <Input style="height:30px;" type="text" bind:value={_meta.right} />
                </div>
                <Button style="margin-left: 20px; height: 30px; width: 70px; background-color: #943131; display:flex; align-items: center; justify-content: center;" 
                on:click={() => {removeElement('meta', i)}}>remove</Button>
            </div>
        {/each}
    </div>
    <Button on:click={() => {meta = [...meta, {left: "", operator: "=", right: ""}]}}
        style="color: var(--color-lightest); background-color: var(--color-strongest); margin-left:40px;">
        <Icon name="plus-lg" />
        Add Meta</Button>

    <div class="block">
        strings:<Button color="warning" style="width:25px; height:25px; border-radius: 20px; display:inline-flex; align-items: center; justify-content: center; font-weight:500; margin-left:40px;">i</Button>
        {#each strings as _string, i}
            <div class="instance">
                <div class="string-name">
                   $ <Input style="height:30px;" type="text" bind:value={_string.left} />
                </div>
                <div class="operator">
                    {_string.operator}
                </div>
                <div class="value">
                    <Input style="height:30px; width:max-content;" type="text" bind:value={_string.right} />
                </div>
                <Button style="margin-left: 20px; height: 30px; width: 70px; background-color: #943131; display:flex; align-items: center; justify-content: center;" 
                on:click={() => {removeElement('strings', i)}}>remove</Button>
            </div>
        {/each}
    </div>
    <Button on:click={() => {strings = [...strings, {left: "", operator: "=", right: ""}]}}
        style="color: var(--color-lightest); background-color: var(--color-strongest); margin-left:40px;">
        <Icon name="plus-lg" />
        Add String</Button>

    <div class="block">
        condition:<Button color="warning" style="width:25px; height:25px; border-radius: 20px; display:inline-flex; align-items: center; justify-content: center; font-weight:500; margin-left:20px;">i</Button>
        <div class="condition">
            {#each condition as _ , i}
            {#if i > 0}
              <div class="input-container">
                <Input type="select" style="margin:0 20px;" bind:value={condtionOperator[i-1]} >
                  <option>and</option>
                  <option>or</option>
                </Input>
              </div>
            {/if}
        
            <div class="input-container">
              <Input type="select" style="margin:0 20px;" bind:value={_}>
                <option> Select variable </option>
                {#each strings as string}
                  <option value={'$'+string.left}> {"$"+string.left} </option>  
                {/each}
              </Input>
            </div>
          {/each}

        </div>
        <Button on:click={() => {condition = [...condition, ""]; condtionOperator=[...condtionOperator, ""]}}
            style="color: var(--color-lightest); background-color: var(--color-strongest)">
            <Icon name="plus-lg" />
            Add Condition</Button>
        {#if condition.length > 1}
            <Button on:click={() => {removeElement('condition', condition.length-1)}}
                style=" background-color: #943131;">
                <Icon name="dash-lg" />
                Remove Condition</Button>
        {/if}

    </div>



    <div>{closeCurly}</div>

</div>
<Alert style="margin:20px;" color={alertColor} isOpen={alertOpen} toggle={() => {alertOpen = false}} fade={true}>
    {alertMessage}
</Alert>
<div class="button-container">
    <Button on:click={copyToClipboard}
    style="background-color: var(--color-active); border-color: var(--color-active); color: var(--color-lightest);">
    <Icon name="files" />
    Copy rule</Button>
</div>
    


<style>

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
    .instance {
        display: flex;
        flex-direction: row;
        align-items: start;
        justify-content: flex-start;
        max-width: 70vw;
        margin: 20px;
        
    }

    .operator {
        margin: 0 10px;
    }

    .block {
        margin: 10px 0px 10px 20px;
    }

    .condition {
        display: flex;
        flex-direction: row;
        align-items: start;
        flex-wrap: wrap;
        justify-content: flex-start;
        max-width: 70vw;
        margin: 20px;
    }

    .value {
        max-width: 500px;
    }

    .button-container {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        margin: 20px;
    }

    .input-container {
    display: flex;
    align-items: center;
    margin: 10px 20px;
  }

  .string-name {
    display: flex;
    align-items: center;
  }
</style>

