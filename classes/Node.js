/**
 * 网格节点
 */
export class Node {
    static WALKABLE = "walkable";
    static NOWALKABLE = "nowalkable";
    static DEATH = "death";
    constructor(xpos, ypos) {
      this.x = xpos;
      this.y = ypos;
      this.type = Node.WALKABLE;
      this.actor = null;
      this.costMultiplier = 1;
      this.f;
      this.g;
      this.h;
      this.parent;
    }
  }