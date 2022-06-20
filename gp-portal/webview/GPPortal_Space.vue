<template>
    <div id="portal" class="gpPortalSpace">
        <div class="gpPortalSpaceBackground"></div>

        <p>
            <span id="fog">A long</span>
            <span id="fog-2">long time</span>
            <span id="glow">ago,</span>
            <span id="light">in a</span>
            <span id="stars">galaxy</span>
            <span id="stars-2">far</span>
            <span id="small-stars">far</span>
            <span id="small-stars-2">away&hellip;</span>
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// Very Important! The name of the component must match the file name.
// Don't forget to do this. This is a note so you don't forget.
const ComponentName = 'GPPortal_Space';
export default defineComponent({
    name: ComponentName,
    // Used to add Custom Components
    components: {},
    // Used to define state
    data() {
        return {
            //
        };
    },
    // Called when the page is loaded.
    mounted() {
        // Bind Events to Methods
        if ('alt' in window) {
            // alt.on('x', this.whatever);
            alt.on(`${ComponentName}:SendSomeData`, this.sendSomeData);
            alt.emit(`${ComponentName}:Ready`);
        }

        // Add Keybinds for In-Menu
        document.addEventListener('keyup', this.handleKeyPress);
    },
    // Called when the page is unloaded.
    unmounted() {
        // Make sure to turn off any document events as well.
        // Only if they are present of course.
        // Example:
        // document.removeEventListener('mousemove', this.someFunction)
        if ('alt' in window) {
            alt.off(`${ComponentName}:Close`, this.close);
        }

        // Remove Keybinds for In-Menu
        document.removeEventListener('keyup', this.handleKeyPress);
    },
    // Used to define functions you can call with 'this.x'
    methods: {
        handleKeyPress(e) {
            // Escape Key
            if (e.keyCode === 27 && 'alt' in window) {
                alt.emit(`${ComponentName}:Close`);
            }
        },
        sendSomeData(arg1: string) {
            console.log(arg1);
        },
    },
});
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    font-size: 1em;
    text-decoration: none;
    border: none;
    list-style: none;
    outline: none;
}

body {
    background: #000;
    overflow: hidden;
    -webkit-animation-name: pulse;
    -webkit-animation-duration: 10s;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: linear;
}

@-webkit-keyframes pulse {
    from {
        background: #000;
    }
    25% {
        background-color: #003;
    }
    50% {
        background-color: #030;
    }
    to {
        background: #000;
    }
}

p {
    z-index: 0;
    color: rgba(0, 0, 0, 0);
}

#fog,
#fog-2 {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2000px;
    height: 2000px;
    margin-top: -1000px;
    margin-left: -1000px;
    opacity: 0.5;
    background: url(/src/pages/gpPortal/img/fog.png) repeat-x 0 center;
    -webkit-animation-name: fogAnimation;
    -webkit-animation-duration: 30s;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: linear;
}

#fog-2 {
    opacity: 1;
    -webkit-animation-duration: 120s;
}

@-webkit-keyframes fogAnimation {
    from {
        -webkit-transform: rotate(0deg);
        background-position: 0 center;
    }
    to {
        -webkit-transform: rotate(360deg);
        background-position: 1000px center;
    }
}

#glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 800px;
    height: 800px;
    margin: -400px 0 0 -400px;
    background: url(/src/pages/gpPortal/img/glow.png) repeat-x 0 0;
    -webkit-animation-name: glowAnimation;
    -webkit-animation-duration: 5s;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: linear;
}

@-webkit-keyframes glowAnimation {
    from {
        opacity: 1;
    }
    50% {
        opacity: 0.75;
    }
    to {
        opacity: 1;
    }
}

#light {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 800px;
    height: 800px;
    margin: -400px 0 0 -400px;
    background: url(/src/pages/gpPortal/img/light.png) no-repeat center center;
    -webkit-animation-name: lightAnimation;
    -webkit-animation-duration: 1s;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: linear;
}

@-webkit-keyframes lightAnimation {
    from {
        opacity: 0.25;
    }
    50% {
        opacity: 0.5;
    }
    to {
        opacity: 0.25;
    }
}

#stars,
#stars-2,
#small-stars,
#small-stars-2 {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 600px;
    height: 600px;
    margin: -300px 0 0 -300px;
    background: url(/src/pages/gpPortal/img/stars-large.png) no-repeat center center;
    -webkit-animation-name: starsLarge;
    -webkit-animation-duration: 60s;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: linear;
}

@-webkit-keyframes starsLarge {
    from {
        -webkit-transform: rotate(0deg) scale(3);
        opacity: 0.1;
    }
    to {
        -webkit-transform: rotate(360deg) scale(0.5);
        opacity: 0;
    }
}

#stars-2 {
    -webkit-animation-name: starsLargeAlt;
    -webkit-animation-duration: 45s;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: linear;
}

@-webkit-keyframes starsLargeAlt {
    from {
        -webkit-transform: rotate(180deg) scale(3);
        opacity: 0.25;
    }
    to {
        -webkit-transform: rotate(360deg) scale(0.5);
        opacity: 0;
    }
}

#small-stars,
#small-stars-2 {
    background: url(/src/pages/gpPortal/img/stars-small.png) no-repeat center center;
    -webkit-animation-duration: 15s;
    -webkit-animation-name: starsSmall;
}

#small-stars-2 {
    -webkit-animation-name: starsSmallAlt;
    -webkit-animation-duration: 30s;
}

@-webkit-keyframes starsSmall {
    from {
        -webkit-transform: rotate(360deg) scale(3);
        opacity: 0.25;
    }
    to {
        -webkit-transform: rotate(0deg) scale(0.5);
        opacity: 0;
    }
}

@-webkit-keyframes starsSmallAlt {
    from {
        -webkit-transform: rotate(0deg) scale(3);
        opacity: 0.1;
    }
    to {
        -webkit-transform: rotate(360deg) scale(0.5);
        opacity: 0;
    }
}

/* fade in and out */
.gpPortalSpaceBackground {
    width: 100vw;
    height: 100vh;
    background: rgb(8, 8, 8);
    -webkit-animation: fadeinout 4s linear forwards;
    animation: fadeinout 4s linear forwards;
}

.gpPortalSpace {
    -webkit-animation: fadeinout 4s linear forwards;
    animation: fadeinout 4s linear forwards;
}

@-webkit-keyframes fadeinout {
    0%,
    100% {
        opacity: 0;
    }
    75% {
        opacity: 0;
    }
    50% {
        opacity: 0;
    }
    30% {
        opacity: 1;
    }
    20% {
        opacity: 1;
    }
}

@keyframes fadeinout {
    0%,
    100% {
        opacity: 0;
    }
    75% {
        opacity: 0;
    }
    50% {
        opacity: 0;
    }
    30% {
        opacity: 1;
    }
    20% {
        opacity: 1;
    }
}
</style>
