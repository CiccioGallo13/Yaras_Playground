<script lang="ts">
    import { Table } from "sveltestrap";
    import { _encodings } from "../routes/+page";
    import type { HighlightedMatches, JsonResponse } from "../model/model";

    export let highlightedText: Map<string, HighlightedMatches>
    export let matches: JsonResponse

    let preClassSpaces = "scrollable-content-spaces";
    let preClassNoSpaces = "scrollable-content-nospaces";


    setTimeout(() => {
        preClassSpaces = "scrollable-content-spaces aaa"
        preClassNoSpaces = "scrollable-content-nospaces aaa"
    }, 300);

</script>

<div id= "table-results" class="options">
    <Table>
        <thead>
            <tr>
                <th>Encoding</th>
                <th>Data</th>
            </tr>
        </thead>
        <tbody>
            {#each _encodings as encoding}
            <tr>
                <td>{encoding}</td>
                <td>
                    <div>
                        {#if encoding === 'hex' || encoding === 'binary' || encoding === 'ascii'}
                            <pre class={preClassSpaces}>{@html highlightedText.get(encoding)?.highlighted_string}</pre>
                        {:else}
                            <pre class={preClassNoSpaces}>{@html highlightedText.get(encoding)?.highlighted_string}</pre>
                        {/if}
                    </div>
                </td>
            </tr>
            {/each}
        </tbody>
    </Table>
    
    <Table>
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

    .scrollable-content-nospaces {
        overflow-y: auto;
        width: 780px;
        line-break: anywhere;
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