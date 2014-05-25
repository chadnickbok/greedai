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

var quadrants = [0,0,0,0];
var best_quadrant = 0;
var best_val = 0;
for (var item_index = 0; item_index < items.length; item_index++)
{
    var cur_item = items[item_index];
    var quadrant_index = Math.floor(cur_item.pos.x / 45.0);
    if (Math.floor(cur_item.pos.y / 35) > 0)
    {
        quadrant_index += 2;
    }
    quadrants[quadrant_index] += cur_item.bountyGold;
    if (quadrants[quadrant_index] > best_val)
    {
        best_val = quadrants[quadrant_index];
        best_quadrant = quadrant_index;
    }
}

for (var peonIndex = 0; peonIndex < peons.length; peonIndex++) {
    var peon = peons[peonIndex];
    var other_peons = base.getByType('peon').slice(0);
    var enemy_peasants = base.getByType('peasant').slice(0);
    
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
    
    
    var all_workers = other_peons.concat(enemy_peasants);
    var nearest_worker = null;
    if (all_workers.length > 0)
    {
         nearest_worker = peon.getNearest(all_workers);
    }

    var new_pos = {x: 44, y: 40};
    
    if ((nearest_worker !== null) && (peon.distance(nearest_worker) < 2))
    {
        var other_peon = nearest_worker;
        if (peon.pos.x < other_peon.pos.x)
        {
            new_pos.x = Math.max(peon.pos.x - 5, 2);
        }
        else
        {
            new_pos.x = Math.min(peon.pos.x + 5, 85);
        }
        
        if (peon.pos.y < other_peon.pos.y)
        {
            new_pos.y = Math.max(peon.pos.y - 5, 2);
        }
        else
        {
            new_pos.y = Math.min(peon.pos.y + 5, 55);
        }
    }
    else
    {
        var peon_quadrant_index = Math.floor(peon.pos.x / 45.0);
        if (Math.floor(peon.pos.y / 35) > 0)
        {
            peon_quadrant_index += 2;
        }
        
        if (peon_quadrant_index != best_quadrant)
        {
            if (best_quadrant == 0)
            {
                new_pos.x = 23;
                new_pos.y = 16;
            }
            else if (best_quadrant == 1)
            {
                new_pos.x = 68;
                new_pos.y = 16;
            }
            else if (best_quadrant == 2)
            {
                new_pos.x = 23;
                new_pos.y = 53;
            }
            else
            {
                new_pos.x = 68;
                new_pos.y = 53;
            }
        }
        else
        {
            var item = peon.getNearest(items);
            new_pos = item.pos;
        }
    }
    base.command(peon, 'move', new_pos);
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

if (base.built.length === 0)
{
    type = 'peon';
}
else
{
    var built_units = base.getFriends().length - base.peasantsBuilt;
    var danger = false;

    var enemies = base.getEnemies();
    if (enemies.length > 0)
    {
        var nearest_enemy = base.getNearest(enemies);
        if (base.distance(nearest_enemy) < 20)
        {
            danger = true;
        }
    }

    if (!danger && (base.peasantsBuilt < Math.min((base.frame / 80), 3)))
    {
        type = 'peon';
    }
    else if (built_units < 2)
    {
        type = 'munchkin';
    }
    else if (built_units < 4)
    {
        type = 'shaman';
    }
    else if (built_units < 5)
    {
        type = 'ogre';
    }
    else if (built_units < 6)
    {
        type = 'fangrider';
    }
    else
    {
        type = 'brawler';
    }
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
