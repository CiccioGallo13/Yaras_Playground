<script lang="ts">
    import { Styles } from "sveltestrap";
    import { fly } from 'svelte/transition';
    import { linear } from 'svelte/easing';
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

	let options = {duration: 300, easing: linear};

</script>

<Styles />

    <Tabs tabItems = {tabItems} activeItem = {$activeTab} on:tabChange={triggerTabChange} />
    {#if $activeTab === 'Basic'}
        <div class="basic-editor" in:fly|global={{...options, x: -1000, delay: 100}} out:fly|global={{...options, x: -1000}}>
            <BasicEditor />
        </div>
    {:else if $activeTab === 'Advanced'}
        <div class="adv-editor" in:fly|global={{...options, duration:500, x: 4000, delay: 100}} out:fly|global={{...options, x: 1000}}>    
            <AdvancedEditor />
        </div>
    {/if}

<style>
.adv-editor {
    margin: 20px;
    z-index: 1;
}

.basic-editor {
    margin: 20px;
    z-index: 2;
}

</style>
