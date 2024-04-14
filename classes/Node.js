/**
 * 网格节点
 */
export class Node {
    static NOWALKABLE = "nowalkable";
    static PROP="prop";
    static DEATH = "death";
    constructor(xpos, ypos) {
      this.x = xpos;
      this.y = ypos;
      this.type = null;
      this.actor = null;
      this.costMultiplier = 1;
      this.f;
      this.g;
      this.h;
      this.parent;
    }
  }