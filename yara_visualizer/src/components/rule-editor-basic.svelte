<script lang="ts">
import type { GenericOperation } from "../model/model";
    import { Styles, Input } from "sveltestrap";

    let ruleName = "rule_name";
    let meta: GenericOperation[] = [];
    let strings: GenericOperation[] = [];
    let condition: string[] = [""];
    let condtionOperator: string[] = [];
    const openCurly = "{";
    const closeCurly = "}";
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
            </div>
        {/each}
        <button on:click={() => {meta = [...meta, {left: "", operator: "=", right: ""}]}}>Add Meta</button>
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
        <button on:click={() => {strings = [...strings, {left: "", operator: "=", right: ""}]}}>Add String</button>
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
                    <option> {string.left}</option>  
                    {/each}
                </Input>
            {/each}

        </div>
        <button on:click={() => {condition = [...condition, ""]; condtionOperator=[...condtionOperator, ""]}}>Add Condition</button>
    </div>



    <div>{closeCurly}</div>

</div>

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