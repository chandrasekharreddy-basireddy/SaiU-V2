export const VIEWS=['home','timetable','ai','planner','more'];let current='home';export function setView(v){if(VIEWS.includes(v))current=v;return current}export function getView(){return current}
