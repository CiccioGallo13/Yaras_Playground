<script lang="ts">
    import { theme } from './stores'
</script>
  
<select bind:value="{$theme}">
    <option value="system">System</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
</select>