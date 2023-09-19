<script lang="ts">
import { onMount } from 'svelte';
import { rulesTextArea } from '$lib/stores';
import { get } from 'svelte/store';
import { parse } from '../parser/parser';
    import { slide } from 'svelte/transition';

let textAreaElement;
let errorMessage: any = '';

onMount(async () => {
    textAreaElement = document.querySelector('textarea')!
    resizeTextArea();
    });

function handleKeyDown(event: KeyboardEvent) {

    if(event.key === 'ArrowRight' && textAreaElement!.selectionStart === textAreaElement!.value.length){
      document.getElementById('text-editor')!.scrollLeft += 20
      return;
    }

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

    document.getElementById('text-editor')!.scrollLeft = 0;

  }

  function parseRules() {
    errorMessage = parse(get(rulesTextArea));
  }


function calcHeight() {
  let numberOfLineBreaks = $rulesTextArea.split('\n').length;
  let newHeight = 21 + numberOfLineBreaks * 21 + 7;
  return newHeight;
}

function calcWidth() {
  let maxLineLength = 0;
  $rulesTextArea.split('\n').forEach(line => {
    if (line.length > maxLineLength) {
      maxLineLength = line.length;
    }
  })

  return maxLineLength * 9 + 20;
}

  function resizeTextArea() {
    let elem: HTMLTextAreaElement = document.querySelector(".resizable")!;
    elem.style.height = calcHeight() + "px";
    elem.style.minWidth = calcWidth() + "px";
  }


</script>

<div class="text-editor" id="text-editor">
    <div class="line-numbers">
        {#each $rulesTextArea.split('\n') as _, index}
            <span>{index + 1}</span>
        {/each}
    </div>
    <textarea id="text-area-editor" class="editor resizable" bind:value={$rulesTextArea} wrap="off" on:keydown={handleKeyDown} on:input={() => {parseRules(); resizeTextArea();}} ></textarea>
</div>
{#if errorMessage !== ''}
  {#if errorMessage === 'Rule parsed successfully'}
    <div class="message-info-ok" transition:slide|global={{duration:100}}>{errorMessage}</div>
  {:else}
    <div class="message-info-error" transition:slide|global={{duration:100}}>
      {#if !RegExp("not referenced in condition").test(errorMessage.message)}
        Line {errorMessage.location.start.line} column {errorMessage.location.start.column}. {errorMessage.message}
      {:else}
        {errorMessage.message}
       {/if}
      </div>
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
  color: white;
}

.message-info-error {
  display: block;
  background-color: rgb(221, 75, 75);
  font-size: 15px;
  font-weight: 500;
  margin-top: 5px;
  padding: 7px 20px 7px 20px;
  color: white;
}

.text-editor {
  display: flex;
  gap: 10px;
  font-family: monospace;
  height: 73vh;
  line-height: 21px;
  overflow: auto;
  background: #282a3a;
  border-radius: 2px;
  padding: 20px 10px;
}

.editor {
  line-height: 21px;
  min-height: 21px;
  overflow-y: hidden;
  overflow-x: hidden;
  height: 100%;
  width: 95%;
  padding: 0;
  border: 0;
  background: #282a3a;
  color: #FFF;
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