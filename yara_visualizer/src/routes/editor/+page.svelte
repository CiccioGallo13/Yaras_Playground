<script lang="ts">
    import { Styles } from "sveltestrap";
    import Tabs from "../../components/tabs.svelte";
    import AdvancedEditor from "../../components/rule-editor-advanced.svelte";
    import BasicEditor from "../../components/rule-editor-basic.svelte";
    import { onMount } from "svelte";
    import { activeTab } from "$lib/stores";

    onMount(async () => {
        document.getElementsByTagName("body")[0].setAttribute("data-load", "complete");
    });
    
    let tabItems = [{name:"Basic", icon:"puzzle"}, {name:"Advanced", icon:"code-slash"}];

    const triggerTabChange = (event: { detail: string; }) => {
        $activeTab = event.detail;
    };

</script>

<Styles />

    <Tabs tabItems = {tabItems} activeItem = {$activeTab} on:tabChange={triggerTabChange} />
    {#if $activeTab === 'Basic'}
        <div class="basic-editor">
            <BasicEditor />
        </div>
    {:else if $activeTab === 'Advanced'}
        <div class="adv-editor">    
            <AdvancedEditor />
        </div>
    {/if}

<style>
.adv-editor {
    margin: 20px;
}

.basic-editor {
    margin: 20px;
}
</style>
