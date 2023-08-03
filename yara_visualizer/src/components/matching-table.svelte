<script lang="ts">
    import { _getFormattedData } from "$lib/utils";
    import { Table } from "sveltestrap";
    import type { JsonResponse } from "../model/model";

    export let matches: JsonResponse;

</script>

<div class="options">
    <Table>
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

<style>
    .options {
        padding-top: 0.6cm;
        z-index: 1;
        display: flex;
    }
    .scrollable-content-spaces {
        overflow-y: auto;
        width: 780px;
        white-space: pre-wrap;
        max-height: 200px;
    }
    
    th {
        color: var(--color-strongest);
    }

    td {
        color: var(--color-strongest);
    }
</style>