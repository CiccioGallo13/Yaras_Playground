<script lang="ts">
    import { Styles } from "sveltestrap";
    import Tabs from "../../components/tabs.svelte";
    import AdvancedEditor from "../../components/rule-editor-advanced.svelte";
    import BasicEditor from "../../components/rule-editor-basic.svelte";

    let tabItems = [{name:"Basic", icon:"puzzle"}, {name:"Advanced", icon:"code-slash"}];
    let activeItem = "Basic";

    const triggerTabChange = (event: { detail: string; }) => {
        activeItem = event.detail;
    };

</script>

<Styles />

    <Tabs tabItems = {tabItems} activeItem = {activeItem} on:tabChange={triggerTabChange} />
    {#if activeItem === 'Basic'}
        <div class="basic-editor">
            <BasicEditor />
        </div>
    {:else if activeItem === 'Advanced'}
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
