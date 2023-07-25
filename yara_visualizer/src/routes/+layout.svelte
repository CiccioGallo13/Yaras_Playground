<script lang="ts">
    import { theme } from './../lib/stores'
    import { Button, ButtonGroup, NavItem, Navbar, NavbarBrand } from 'sveltestrap';

</script>
  
<svelte:head>
    <meta name="color-scheme" content={$theme == 'system' ? 'light dark' :
    $theme}/> <link rel="stylesheet" href={`/theme/${$theme}.css`} />
</svelte:head>


<Navbar style="background-color: hsl(0deg, 0%, 30%);" expand="md">
    <p>YARA VISUALIZER</p>
    <NavItem style="color: var(--color-lightest)">
        <ButtonGroup>
            <Button active={$theme == 'light'} on:click={() => {theme.set('light')}}
                style="background-color: white; color: #333; border-width:1px; border-radius: 20; font-size: 15px; height:35px;">Light</Button>
            <Button active={$theme == 'system'} on:click={() => {theme.set('system')}}
                style="background-color: gray; color: #333; border-width:1px; border-radius: 20; font-size: 15px; height:35px;">System</Button>
            <Button active={$theme == 'dark'} on:click={() => {theme.set('dark')}} 
                style="background-color: black; color: #f9f9f9; border-width:1px; border-radius: 20; font-size: 15px; height:35px;">Dark</Button>
        </ButtonGroup>
    </NavItem>
</Navbar>

<slot />

<style>

    p {
        font-size: 23px;
        font-weight: bold;
        margin: 0 0 0 30px;
        padding: 0;
        color: white;
    }
</style>