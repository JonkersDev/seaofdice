/// CLASSES

const currentWater = [
    [0,0],
    [1,0],
    [2,0],
    [3,0],
    [4,0],
    [5,0],
    [6,0],
    [0,1],
    [5,1],
    [0,2],
    [6,2],
    [0,6],
    [6,6],
    [0,7],
    [5,7],
    [0,8],
    [1,8],
    [2,8],
    [3,8],
    [4,8],
    [5,8],
    [6,8],
]

/// COMBAT 
class Combat {

    async start(){
        addLog('Started combat')
        let sp = [[[1,1],[3,2],[4,1]],[[1,7],[3,6],[4,7]]];
        this.players.forEach((pl, idx)=> pl.dice.forEach((d, ind)=> new Dice(pl, d, sp[idx][ind][0], sp[idx][ind][1])));
        this.loadingsceen.remove();
        await sleep(2000);
        this.players.forEach(pl=>pl.diceObjects.forEach(d=>d.roll()))
    }

    async nextRound(){
        await sleep(1000);
        for( let i = this.pl2.fieldDice.length; i > 0; i-- ) this.pl2.fieldDice[i - 1].use();
    }
    
    constructor (pl1, pl2){

        this.loadingsceen = newElm('div', 'loadingscreen', body);
        combat = this;
        document.querySelector('#homescreen').remove();
        this.seed = newSeed();
        this.scene = newElm('div', 'scene', body);
        this.sea = newElm('div', 'sea', this.scene);
        this.tiles = [];
        this.tilesArr = [];
        for(let y = 0; y < 9; y++){
            this.tilesArr.push([]);
            for(let x = 0; x < 6 + ((y + 1) % 2); x++){
                let tile = new Tile(x, y);
                this.tilesArr[y].push(tile);
                this.tiles.push(tile);
            }
        }
        this.tiles.forEach(t=>t.setBuren(t.x, t.y));
        this.players = [pl2, pl1];
        this.start();
    }
}

class Tile {
    constructor(x,y){
        this.e = newElm('div', `tile x${x} y${y}`, combat.sea)
        if (currentWater.filter(w => (w[0] == x && w[1] == y)).length) this.e .classList.add('nvt');
        this.x = x;
        this.y = y;
        this.e.x = x;
        this.e.y = y;
        this.buren = [0,0,0,0,0,0]

        this.e.onclick = ()=> {
            selectAll('.tile').forEach(t=>t.classList.remove('roll-option') );
        };
    }
    setBuren(x, y){
        this.offset = 0
        if( y % 2 == 0 ) this.offset = -1

        if( y > 0 && x + this.offset >= 0 ) this.buren[0] = combat.tilesArr[y - 1][x + this.offset];
        if( y > 0 && x < 6 ) this.buren[1] = combat.tilesArr[y - 1][x + 1 + this.offset];
        if( x + this.offset <= 4 ) this.buren[2] = combat.tilesArr[y][x + 1];
        if( y < 8  && x < 6 ) this.buren[3] = combat.tilesArr[y + 1][x + 1 + this.offset];
        if( y < 8  && x + this.offset >= 0 ) this.buren[4] = combat.tilesArr[y + 1][x + this.offset];
        if( x > 0 ) this.buren[5] = combat.tilesArr[y][x - 1];
    }

    resetClass = ()=>{ this.e.classList.remove('roll-option'); }
}

class Player {
    constructor(cl){
        this.dice = [
            [[Cannon, Cannon, Cannon, Cannon, Cannon, Cannon],[Shield, Shield, Shield, Shield, Shield],[Cannon, Cannon, Cannon, Cannon, Cannon, Cannon],[Cannon],[Cannon],[Cannon]],
            [[Shield],[Cannon],[Shield],[Cannon],[Shield],[Cannon]],
            [[Cannon],[Shield],[Shield],[Cannon],[Cannon],[Shield]],
        ];
        this.diceObjects = [],
        this.rerolls = 3;
        this.cl = cl;
    }

}

class Dice {
    constructor(player, die, x, y){
        /// SET VARIABLES
        this.player = player;
        this.faces = [];
        this.waverotate = 360;
        this.offx = 0;
        this.offy = 0;
        this.value = 0;
        this.hp = 10;

        /// CREATE ELEMENTS
        this.container = newElm('div', 'dice-container ' + player.cl, combat.sea);
        this.container.setAttribute('data-x' ,x);
        this.container.setAttribute('data-y', y);
        this.tile = select(`.tile.x${x}.y${y}`);
        this.tile.classList.add("occupied")
        this.tile.dice = this;
        this.wave = newElm('div', 'wave', this.container);
        this.wave.style = `animation-delay: -${Math.floor(Math.random() * 60)}s`
        this.dice = newElm('div', 'dice', this.wave);
        die.forEach((d, ind)=>{
            let face = newElm('div', `face f${ind} pip${d.length}`, this.dice);
            this.faces.push([]);
            d.forEach(pip=>{
                this.faces[ind].push(new pip(face));
            })
            face.innerHTML += select('#diceface').innerHTML;
        })
        this.hpbar = newElm('div', 'hpbar', this.container);

        /// SET ELEMENT REFERENCES
        this.container.obj = this;
        this.dice.obj = this;
        player.diceObjects.push(this)

        /// MAKE DRAGGABLE
        dragElement(this.container);
    }

    async roll() {
        this.faces[this.value].forEach(async (p, ind) => await p.offGoing(this, ind));
        this.container.style.transform = `rotateX(${this.waverotate}deg)`;
        this.waverotate += 360;
        this.value = Math.floor(Math.random() * 6 );
        this.dice.setAttribute('data-roll', this.value);
        addLog(this.player.cl + ' rolled to ' + this.container.getAttribute('data-x') +', '+ this.container.getAttribute('data-y'))
        return new Promise (async r=>{
            await sleep(1000);
            this.faces[this.value].forEach(async (p, ind)=>{
                await sleep(200 * ind);
                await p.onRoll(this, ind);
                await p.onGoing(this, ind);
            });
            r();
        })
    }
    async use(target, x, y, dis){
        return new Promise (async r=>{
            this.container.style.pointerEvents = 'none';
            this.faces[this.value].forEach(async (p, ind)=>{
                await sleep(200 * ind)
                await p.onUse(this, target, dis, ind)
            });
            await sleep(2000)
            this.container.style.pointerEvents = '';
            r();
        })
    }
}

class Pip {
    constructor(face, type){
        this.e = newElm('div', `pip`, face);
        this.e.innerHTML = select(`#${type}`).innerHTML;
    }
    onUse(){ return; }
    onRoll(){ return; }
    onGoing(){ return; }
    offGoing(){ return; }

    dragStart(tile) { return; }
}

class Cannon extends Pip {
    constructor(face){
        super(face, 'cannonball');
    }
    async onUse(dice, target, dis, pipindex){
        return new Promise(async r=>{
            console.log(dice)
            highlightPip(this.e)
            let cannonbal = newElm('div', 'cannon', dice.container);
            cannonbal.style.left = pipindex % 3 * 25 + 25 + '%';
            this.y = 0;
            this.collision = false;
            while(this.y < dis + 300){
                selectAll(`.dice-container`).forEach(d=>{
                    if ( d == dice.container ) return;
                    if (isCollision(d, cannonbal)) this.collision = d;
                });
                this.y+=15;
                cannonbal.style.bottom = this.y + 'px';
                await sleep(20)
                if( this.collision ) break;
            }
            r();
            cannonbal.remove();
        })
    }
    async onRoll() {
        return new Promise(async r=>{
            highlightPip(this.e)
            return;
        })
    }

    dragStart(tile) {
        for(let i = 0; i < 4; i++){
            let nextTile = tile.buren[i];
            while (nextTile) {
                if (nextTile.e.dice) nextTile.e.classList.add('valid-target');
                else nextTile.e.classList.add('invalid-target');
                nextTile = nextTile.buren[i];
            }
        }
    }
}
class Shield extends Pip {
    constructor(face){
        super(face, 'shield');
    }
    async onGoing() {
        return new Promise(async r=>{
            this.e.classList.add('ongoing')
            return;
        })
    }
    async offGoing() {
        return new Promise(async r=>{
            this.e.classList.remove('ongoing')
            return;
        })
    }
}
