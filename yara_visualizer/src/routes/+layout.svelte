<script lang="ts">
    import { theme } from './../lib/stores'
    import { Button, ButtonGroup, NavItem, Navbar, NavbarBrand, Row } from 'sveltestrap';
    import { goto } from '$app/navigation';

</script>
  
<svelte:head>
    <meta name="color-scheme" content={$theme == 'system' ? 'light dark' :
    $theme}/> <link rel="stylesheet" href={`/theme/${$theme}.css`} />
</svelte:head>

<Navbar style="background-color: hsl(0deg, 0%, 30%);" expand="md">
    <div class="left-group">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <p id="title" class="zoom-hover" on:click={() => {goto("/")}} >YARA'S PLAYGROUND</p>
        
        <div class="vl"></div>
        <div class="zoom-hover">
            <NavbarBrand style="color: white; margin-left: 20px;" href="/editor"> Rule Editor </NavbarBrand>
        </div>
        
    </div>
    
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
        cursor: pointer;
        margin: 0 0 0 30px;
        padding: 0;
        color: white;
    }

    .left-group {
        display: flex;
        align-items: center;
    }

    .vl {
        border-left: 1px solid white;
        height: 30px;
        margin-left: 20px;
    }
        
</style>