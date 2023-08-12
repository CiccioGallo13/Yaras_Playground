<script lang="ts">
import { onMount } from 'svelte';

let textAreaElement;

onMount(async () => {
    textAreaElement = document.querySelector('textarea')!
    });

let textArea: string = '';
let cursorPosition: number | null = null;

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      const start = textAreaElement!.selectionStart;
      const end = textAreaElement!.selectionEnd;

      textArea = textArea.substring(0, start) + '\t' + textArea.substring(end);

      setTimeout(() => {
        textAreaElement!.selectionStart = start + 1;
        textAreaElement!.selectionEnd = start + 1;
      });

      event.preventDefault();
    }
  }



</script>

<div class="text-editor">
    <div class="line-numbers">
        {#each textArea.split('\n') as _, index}
            <span>{index + 1}</span>
        {/each}
    </div>
    <textarea bind:value={textArea} on:keydown={handleKeyDown}></textarea>
</div>

<style>
.text-editor {
  display: flex;
  gap: 10px;
  font-family: monospace;
  line-height: 21px;
  background: #282a3a;
  border-radius: 2px;
  padding: 20px 10px;
}

textarea {
  line-height: 21px;
  overflow-y: hidden;
  padding: 0;
  border: 0;
  background: #282a3a;
  color: #FFF;
  min-width: 500px;
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