// This code runs once per frame. Build units and command peons!
// Destroy the human base within 180 seconds.
// Run over 4000 statements per call and chooseAction will run less often.
// Check out the green Guide button at the top for more info.

var base = this;

/////// 1. Command peons to grab coins and gems. ///////
// You can only command peons, not fighting units.
// You win by gathering gold more efficiently to make a larger army.
// Click on a unit to see its API.
var items = base.getItems();
var peons = base.getByType('peon');
for (var peonIndex = 0; peonIndex < peons.length; peonIndex++) {
    var peon = peons[peonIndex];
    var other_peons = base.getByType('peon').slice(0);
    
    var index = -1;
    for (var i = 0, len = other_peons.length; i < len; i++) {
        if (other_peons[i].id == peon.id) {
            index = i;
            break;
        }
    }

    if (index != -1)
    {
        other_peons.splice(index, 1);
    }
    
    var all_items = other_peons.concat(items);
    
    var item = peon.getNearest(all_items);
    
    if (item.type == "peon")
    {
        var new_pos = {x: 0, y: 0};
        var other_peon = item;
        if (peon.pos.x < other_peon.pos.x)
        {
            new_pos.x = peon.pos.x - 5;
        }
        else
        {
            new_pos.x = peon.pos.x + 5;
        }
        
        if (peon.pos.y < other_peon.pos.y)
        {
            new_pos.y = peon.pos.y - 5;
        }
        else
        {
            new_pos.y = peon.pos.y + 5;
        }
        
        base.command(peon, 'move', new_pos);
    }
    else
    {
        base.command(peon, 'move', item.pos);
    }
}


/////// 2. Decide which unit to build this frame. ///////
// Peons can gather gold; other units auto-attack the enemy base.
// You can only build one unit per frame, if you have enough gold.
if (typeof base.peasantsBuilt === 'undefined')
{
    base.peasantsBuilt = 0;
    base.frame = 0;
}

var type;

if ((base.peasantsBuilt < (base.frame / 80)))
{
    type = 'peon';
}
else if (base.built.length === 0)
{
    type = 'peon';
}
else
{
    type = 'ogre';
}

if (base.gold >= base.buildables[type].goldCost)
{
    base.build(type);
    if (type == 'peon')
    {
        ++base.peasantsBuilt;
    }
}

base.frame++;

// 'peon': Peons gather gold and do not fight.
// 'munchkin': Light melee unit.
// 'ogre': Heavy melee unit.
// 'shaman': Support spellcaster.
// 'fangrider': High damage ranged attacker.
// 'brawler': Mythically expensive super melee unit.
// See the buildables documentation below for costs and the guide for more info.
