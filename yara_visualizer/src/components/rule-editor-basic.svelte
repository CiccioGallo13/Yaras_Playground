<script lang="ts">
    import { Styles, Input, Button, Alert, Icon, Toast, ToastHeader, ToastBody } from "sveltestrap";
    import { copyText } from "svelte-copy";
    import { metaInfo, stringsInfo, conditionInfo } from "./constants";
    import { parse } from "../parser/parser";
    import { ruleName, meta, strings, condition, condtionOperator } from "$lib/stores";
    import { fly, scale, slide } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { linear } from "svelte/easing";

    let alertColor: any = "success";
    let alertMessage: string = "Copied to clipboard";
    let alertOpen: boolean = false;
    let toastOpen: boolean = false;
    let toastHeader: string = "";
    let toastBody: string = "";

    const openCurly = "{";
    const closeCurly = "}";

    function toggle() {
        toastOpen = !toastOpen;
    }

    function removeElement<T>(whichArray: string, indexToRemove: number) {
        switch(whichArray) {
            case "meta":
                $meta = $meta.filter((_, index) => index != indexToRemove);
                break;
            case "strings":
                $strings = $strings.filter((_, index) => index != indexToRemove);
                break;
            case "condition":
                $condition = $condition.filter((_, index) => index != $condtionOperator.length-1);
                $condtionOperator = $condtionOperator.filter((_, index) => index != $condtionOperator.length-1);
                break;
        }
    }

    function copyToClipboard() {
        let invalid = false;
        $condtionOperator.forEach(element => {
            if(element != "and" && element != "or") {
                alertColor = "danger";
                alertMessage = "Select an operator for condition";
                alertOpen = true;
                invalid = true;
                return;
            }
            
        });

        $condition.forEach(element => {
            if(!element.startsWith("$")) {
                alertColor = "danger";
                alertMessage = "Select a variable for condition";
                alertOpen = true;
                invalid = true;
                return;
            }
        });

        if(invalid) {
            return;
        }
        let parserOutput = parse(getStringRule());
        if(parserOutput != "Rule parsed successfully") {
            alertColor = "danger";
            alertMessage = 'Line '+parserOutput.location.start.line+' column '+parserOutput.location.start.column+'. '+parserOutput.message;
            alertOpen = true;
            invalid = true;
            return;
        }

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
        rule += "rule "+ $ruleName + "\n{";
        if($meta.length > 0)
        {    
            rule += "    meta:\n";
            for (let _meta of $meta) {
                rule += "        " + _meta.left + " " + _meta.operator + " " + _meta.right + "\n";
            }
        }
        rule += "    strings:\n";
        for (let _string of $strings) {
            rule += "        " +"$"+_string.left + " " + _string.operator + " " + _string.right + "\n";
        }
        rule += "    condition:\n";
        for (let i = 0; i < $condition.length-1; i++) {
            rule += "        " +$condition[i] + " " + $condtionOperator[i] + "\n";
        }
        rule += "        " + $condition[$condition.length-1] + "\n}";
        return rule;
    }

</script>

<Styles />

{#if toastOpen}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="overlay" on:click={toggle}>
    <div on:click|stopPropagation={e => e.stopPropagation()}>
      <Toast isOpen={toastOpen} style="position: relative; overflow: auto; width: 50vw; height: 70vh; background-color: var(--color-lighter); ">
          <ToastHeader toggle={toggle} style="color: black;">
              {toastHeader}
          </ToastHeader>
          <ToastBody style="overflow: auto;">
              {@html toastBody}
          </ToastBody>
      </Toast>
    </div>
  </div>
  
{/if}

<div class="rule">
    <div class="rule-name">
        rule <input type="text" bind:value={$ruleName} />
    </div>
    <div>{openCurly}</div>


    <div class="block">
            meta:<Button color="warning" on:click={() => {toastHeader = "Metadata"; toastBody = metaInfo; toggle()}}
            style="width:25px; height:25px; border-radius: 20px; display:inline-flex; align-items: center; justify-content: center; font-weight:500; margin-left:50px;">i</Button>
        {#each $meta as _meta, i}
            <div class="instance" transition:slide|local={{duration:250}}>
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
    <Button id="add-meta" on:click={() => {$meta = [...$meta, {left: "", operator: "=", right: ""}]}}
        style="color: var(--color-lightest); background-color: var(--color-strongest); margin-left:40px;">
        <Icon name="plus-lg" />
        Add Meta</Button>

    <div class="block">
        strings:<Button color="warning" on:click={() => {toastHeader = "Strings"; toastBody = stringsInfo; toggle()}}
        style="width:25px; height:25px; border-radius: 20px; display:inline-flex; align-items: center; justify-content: center; font-weight:500; margin-left:40px;">i</Button>
        {#each $strings as _string, i}
            <div class="instance" transition:slide|local={{duration:250}}>
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
    <Button id="add-string" on:click={() => {$strings = [...$strings, {left: "", operator: "=", right: ""}]}}
        style="color: var(--color-lightest); background-color: var(--color-strongest); margin-left:40px;">
        <Icon name="plus-lg" />
        Add String</Button>

    <div class="block">
        condition:<Button color="warning" on:click={() =>{toastHeader = "Condition"; toastBody = conditionInfo; toggle()}}
        style="width:25px; height:25px; border-radius: 20px; display:inline-flex; align-items: center; justify-content: center; font-weight:500; margin-left:20px;">i</Button>
        <div class="condition">
            {#each $condition as _ , i}
            <div class="cond-instance" transition:slide|local={{duration:250}}>
            {#if i > 0}
              <div class="input-container">
                <Input type="select" style="margin:0 20px;" bind:value={$condtionOperator[i-1]} >
                  <option>Select operator</option>
                  <option>and</option>
                  <option>or</option>
                </Input>
              </div>
            {/if}
        
            <div class="input-container">
              <Input type="select" style="margin:0 20px;" bind:value={_}>
                <option> Select variable </option>
                {#each $strings as string}
                  <option value={'$'+string.left}> {"$"+string.left} </option>  
                {/each}
              </Input>
            </div>
            </div>
          {/each}

        </div>
        <Button id="add-cond" on:click={() => {$condition = [...$condition, ""]; $condtionOperator =[...$condtionOperator, "Select operator"]}}
            style="color: var(--color-lightest); background-color: var(--color-strongest)">
            <Icon name="plus-lg" />
            Add Condition</Button>
        {#if $condition.length > 1}
            <Button id="rm-cond" on:click={() => {removeElement('condition', $condition.length-1)}}
                style=" background-color: #943131;">
                <Icon name="dash-lg" />
                Remove Condition</Button>
        {/if}

    </div>



    <div>{closeCurly}</div>

</div>

{#if alertOpen}
    {#if alertColor == "success"}
    <div class="custom-alert-success" transition:slide|global={{duration:100}}>
        {alertMessage}
        <button class="close-button" on:click={() =>{alertOpen=false}}>&times;</button>
      </div>
    {:else if alertColor =="danger"}
    <div class="custom-alert-danger" transition:slide|global={{duration:100}}>
        {alertMessage}
        <button class="close-button" on:click={() =>{alertOpen=false}}>&times;</button>
      </div>
    {/if}

{/if}
<div class="button-container">
    <Button id="clear-button" on:click={() => {$meta = []; $strings = []; $condition = [""]; $condtionOperator = []; $ruleName = "rule_name"}}
        style="background-color: var(--color-strongest); border-color: var(--color-strongest); color: var(--color-lightest); margin-right: 20px;">
    <Icon name="trash" />
    Clear</Button>
    
    <Button id="copy-button" on:click={copyToClipboard}
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
    background-color: rgba(0, 0, 0, 0.6);
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

    .cond-instance {
        display: flex;
        flex-direction: row;
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

  .custom-alert-success {
    margin: 10px;
    background-color: #38a656;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    padding-right: 10px;
    z-index: 1; 
  }

  .custom-alert-danger {
    margin: 10px;
    background-color: #bd4e48;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    padding-right: 10px;
    z-index: 1; 
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    color: rgb(54, 54, 54);
  }

</style>

