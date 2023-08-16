<script lang="ts">
import type { GenericOperation } from "../model/model";
    import { Styles, Input, Button } from "sveltestrap";
    import { copyText } from "svelte-copy";

    let ruleName: string = "rule_name";
    let meta: GenericOperation[] = [];
    let strings: GenericOperation[] = [];
    let condition: string[] = [""];
    let condtionOperator: string[] = [];
    const openCurly = "{";
    const closeCurly = "}";

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

<div class="rule">
    <div class="rule-name">
        rule <input type="text" bind:value={ruleName} />
    </div>
    <div>{openCurly}</div>


    <div class="block">
        meta:
        {#each meta as _meta}
            <div class="instance">
                <div class="meta-name">
                    <input type="text" bind:value={_meta.left} />
                </div>
                <div class="operator">
                    {_meta.operator}
                </div>
                <div class="meta-value">
                    <input type="text" bind:value={_meta.right} />
                </div>
                <Button on:click={() => {}}> remove</Button>
            </div>
        {/each}
        <Button on:click={() => {meta = [...meta, {left: "", operator: "=", right: ""}]}}>Add Meta</Button>
    </div>

    <div class="block">
        strings:
        {#each strings as _string}
            <div class="instance">
                <div class="string-name">
                   $ <input type="text" bind:value={_string.left} />
                </div>
                <div class="operator">
                    {_string.operator}
                </div>
                <div class="string-value">
                    <input type="text" bind:value={_string.right} />
                </div>
            </div>
        {/each}
        <Button on:click={() => {strings = [...strings, {left: "", operator: "=", right: ""}]}}>Add String</Button>
    </div>

    <div class="block">
        condition:
        <div class="condition">
            {#each condition as _ , i}
                
                {#if i > 0}
                    <Input type="select" style="margin:0 20px;" bind:value={condtionOperator[i-1]} >
                        <option> and </option>
                        <option> or </option>
                    </Input>
                {/if}

                <Input type="select" style="margin:0 20px;" bind:value={_} >
                    {#each strings as string}
                    <option> {"$"+string.left} </option>  
                    {/each}
                </Input>
            {/each}

        </div>
        <Button on:click={() => {condition = [...condition, ""]; condtionOperator=[...condtionOperator, ""]}}>Add Condition</Button>

    </div>



    <div>{closeCurly}</div>

</div>
<Button on:click={() => {copyText(getStringRule())}}>Copy rule</Button>

<style>
    .instance {
        display: flex;
        flex-direction: row;
        align-items: start;
        justify-content: baseline;
        margin: 20px;
        
    }

    .operator {
        margin: 0 10px;
    }

    .block {
        margin: 20px;
    }

    .condition {
        display: flex;
        flex-direction: row;
        align-items: start;
        justify-content: baseline;
        margin: 20px;
    }
</style>

