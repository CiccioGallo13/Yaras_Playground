<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Styles, Icon } from 'sveltestrap';
    import type { TabItem } from '../model/model';

    const dispatch = createEventDispatcher();

    export let tabItems: TabItem[];
    export let activeItem: string;

</script>

<Styles />

<div class="tabs">
    <ul>
        {#each tabItems as item}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li on:click={() => dispatch('tabChange', item.name)}>
                <div class:active={item.name===activeItem}>{item.name}
                <Icon name={item.icon} />
                </div>
            </li>
        {/each}
    </ul>
</div>

<style>
    .tabs {
        margin-top: 10px;
    }
    ul {
        display: flex;
        justify-content: center;
        padding: 0;
        list-style-type: none;
    }
    li {
        margin: 0 16px;
        font-size: 18px;
        color: (--color-strongest);
        cursor: pointer;
    }
    .active {
        color: var(--color-active);
        border-bottom: 2px solid var(--color-active);
        padding-bottom: 8px;
    }

</style>