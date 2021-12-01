'use strict'

class Chain {
  constructor(fn, successor) {
    this.fn = fn;
    this.successor = successor;
    this.next = this.next.bind(this);
  }

  async next () {
    let [ret, jobid, context] = await this.fn.apply(this, arguments);
    if (ret === 'next') {
      return this.successor && this.successor.next.apply(this.successor, [jobid, context])
    }
    return ret;
  }
}


module.exports = Chain;