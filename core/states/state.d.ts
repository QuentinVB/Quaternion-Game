/// <reference path="../../libs/babylon.d.ts" />
export default abstract class State {
    private context;
    constructor(context: any);
    abstract Update(): void;
}
