
/// GLOBAL FIXED VARIABLES
const body = document.body;
const vh = window.innerHeight / 100;
const templateUI = document.querySelector('#ui');

/// GLOBAL VARIABLES
let combat;

/// LOG
const log = (val)=>{ console.log(val); }


/// DRAG ELEMENTS
let target = null;
function dragElement(el) {
    let sx = 0, sy = 0, tsx = 0, tsy = 0, tpx = 0, tpy = 0, lasso = undefined, d = 0, r_angle = 0;
    el.onmousedown = dragMouse;
    el.ontouchstart = dragTouch;

    function startDrag(e){
        target = null;
        combat.tiles.forEach(ti=>ti.resetClass())
        el.classList.add('dragging');
        sx = parseInt(el.getAttribute('data-x'));
        sy = parseInt(el.getAttribute('data-y'));

        let range = 2;
        let rollOptions = [combat.tilesArr[sy][sx]]
        for(i = 0; i < range; i++){
            rollOptions.forEach(ro=>{
                ro.buren.forEach(b=>{
                    if(b && !b.e.dice) {
                        b.e.classList.add('roll-option');
                        rollOptions.push(b)
                    }
                })  
            })
        }

        el.obj.faces[el.obj.value].forEach(pip=>{
            pip.dragStart(combat.tilesArr[sy][sx]);
        })
    }

    function dragMouse(e){
        startDrag(e)
        tsx = e.clientX;
        tsy = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function dragTouch(e){
        startDrag(e)
        tsx = e.targetTouches[0].pageX;
        tsy = e.targetTouches[0].pageY;
        document.ontouchend = closeDragElement;
        document.ontouchmove = dragMobile;
    }
    function dragMobile(e){
        tpx = e.targetTouches[0].pageX;
        tpy = e.targetTouches[0].pageY;
        getHoverTarget('tile');
        el.style.rotate = r_angle + 'deg'
    }
    function elementDrag(e){
        tpx = e.clientX;
        tpy = e.clientY;
        getHoverTarget('tile');
        el.style.rotate = r_angle + 'deg'
    }
    async function closeDragElement(e){
        document.onmouseup = null;
        document.ontouchend = null;
        document.onmousemove = null;
        document.ontouchmove = null;
        if(lasso) lasso.remove();
        lasso = null;

        el.classList.remove('dragging');
        if(!target) return;
        target.classList.remove('hover')
        if(target) {
            if(!target.dice&&target.classList.contains('roll-option')){
                target.classList.add('occupied')
                el.obj.tile.classList.remove('occupied')
                select(`.tile.x${el.getAttribute('data-x')}.y${el.getAttribute('data-y')}`).dice = null;
                el.setAttribute('data-x',target.x);
                el.setAttribute('data-y',target.y);
                el.obj.roll();
                target.dice = el
                el.obj.tile = target;
            } else if (target.classList.contains('valid-target')){
                el.obj.use(target.dice, tpx, tpy, d)
            }
        }
        combat.tiles.forEach(ti=>ti.resetClass())
    }
    /// GET HOVER TARGET
    let classEml = null;
    function getHoverTarget(cl){
        let newTarget = null;
        selectAll(`.${cl}`).forEach(d=>{
            let b = d.getBoundingClientRect();
            if(tpx > b.left && tpy > b.top && tpx < b.left + b.width && tpy < b.top + b.height) {
                d.classList.add('hover');
                newTarget = d;
            }
            else d.classList.remove('hover');
        })

        if(el.obj.tile && newTarget){
            if(newTarget != target){
                target = newTarget;
                if(!lasso) {
                    lasso = newElm('div', 'lasso', combat.sea);
                    classEml = newElm('div', '', lasso);
                    newElm('div', '', lasso);
                    newElm('div', '', lasso);
                    newElm('div', '', lasso);
                    newElm('div', '', lasso);
                    newElm('div', '', lasso);
                }
                classEml.classList = target.classList.value
                let la = el.obj.tile.offsetLeft + (el.obj.tile.offsetWidth / 2);
                let ta = el.obj.tile.offsetTop + (el.obj.tile.offsetHeight / 2);
                let lb = target.offsetLeft + (target.offsetWidth / 2);
                let tb = target.offsetTop + (target.offsetHeight / 2);
                r_angle = angle(la, ta, lb, tb);
                d = distance(la, ta, lb, tb);
                lasso.style = `top: ${ta}px; left: ${la}px; --lw: ${d * 0.95}px; rotate: ${ r_angle - 90}deg;`
            } 
        } 
    }
  }

  /// GENERATE SEED
  const newSeed = () => {
    let seed = '';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 9; i++) {
      seed += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return seed;
  };

/// AWAIT SLEEP
const sleep = async (ms)=>{
    return new Promise((r)=>{
        setTimeout(()=>{r()}, ms);
    })
}

/// NEXT ROUND
const endTurn = ()=>{
    game.pl1.rerolls = 3;
    game.nextRound();
}
/// NEW ELEMENT
const newElm = (e, c, p)=>{
    let elm = document.createElement(e);
    elm.classList = c;
    if (p) p.append(elm);
    return elm;
}
/// CHECK COLLISION
function isCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
  
    return !(
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom ||
      rect1.right < rect2.left ||
      rect1.left > rect2.right
    );
}
/// DOCUMENT QUERYSELECTOR
const select = (cl)=> document.querySelector(cl);
const selectAll = (cl)=> document.querySelectorAll(cl);
/// CALCULATE ANGLE
const angle = (cx, cy, ex, ey) =>  90 + Math.atan2(ey - cy, ex - cx) * 180 / Math.PI;

/// CALCULATE DISTANCE
const distance = (cx, cy, ex, ey) => {
    let a = cx - ex;
    let b = cy - ey;
    return Math.sqrt( a*a + b*b );
}
///HIGHLIGHT PIP
const highlightPip = async (e)=>{
    e.classList.add('highlight')
    await sleep(200);
    e.classList.remove('highlight')
}

/// ADD LOG
const addLog = (val)=>{
    document.querySelector('#logs').innerHTML += `<li>${val}</li>`
}