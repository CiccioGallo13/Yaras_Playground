<script lang="ts">
import { onMount } from 'svelte';
import { rulesTextArea } from '$lib/stores';
import { get } from 'svelte/store';
import { parse } from '../parser/parser';

let textAreaElement;
let errorMessage: string = '';

onMount(async () => {
    textAreaElement = document.querySelector('textarea')!
    });


function handleKeyDown(event: KeyboardEvent) {

    if (event.key === 'Tab') {
      const start = textAreaElement!.selectionStart;
      const end = textAreaElement!.selectionEnd;

      $rulesTextArea = get(rulesTextArea).substring(0, start) + '\t' + get(rulesTextArea).substring(end);

      setTimeout(() => {
        textAreaElement!.selectionStart = start + 1;
        textAreaElement!.selectionEnd = start + 1;
      });

      event.preventDefault();
    }

  }

  function parseRules() {
    errorMessage = parse(get(rulesTextArea));
  }



</script>

<div class="text-editor">
    <div class="line-numbers">
        {#each $rulesTextArea.split('\n') as _, index}
            <span>{index + 1}</span>
        {/each}
    </div>
    <textarea class="editor" bind:value={$rulesTextArea} on:keydown={handleKeyDown} on:input={parseRules}></textarea>
</div>
{#if errorMessage !== ''}
  {#if errorMessage === 'Rule parsed successfully'}
    <div class="message-info-ok">{errorMessage}</div>
  {:else}
    <div class="message-info-error">{errorMessage}</div>
  {/if}
{/if}

<style>
.message-info-ok {
  display: block;
  background-color: rgb(49, 157, 49);
  font-size: 15px;
  font-weight: 500;
  margin-top: 5px;
  padding: 7px 20px 7px 20px;
}

.message-info-error {
  display: block;
  background-color: rgb(221, 75, 75);
  font-size: 15px;
  font-weight: 500;
  margin-top: 5px;
  padding: 7px 20px 7px 20px;
}

.text-editor {
  display: flex;
  gap: 10px;
  font-family: monospace;
  line-height: 21px;
  background: #282a3a;
  border-radius: 2px;
  padding: 20px 10px;
}

.editor {
  line-height: 21px;
  overflow-y: hidden;
  padding: 0;
  border: 0;
  background: #282a3a;
  color: #FFF;
  width: 90vw;
  height: 65vh;
  outline: none;
  resize: none;
}

.line-numbers {
  width: 20px;
  text-align: right;
}

.line-numbers span {
  display: block;
  color: #6d86a1;
}
</style>