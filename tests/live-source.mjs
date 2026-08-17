import {CATALOG,sheetCsvUrl} from '../js/catalog.js';
import {parseCsv,timetableStats} from '../js/timetable.js';

const response=await fetch(sheetCsvUrl(),{cache:'no-store'});
if(!response.ok)throw new Error(`Live timetable source returned HTTP ${response.status}`);
const csv=await response.text();
if(!csv.includes(',')||csv.length<100)throw new Error('Live timetable source returned an unexpectedly small/non-CSV response');
let checked=0;
let sectionChecks=0;
for(const school of CATALOG.schools){
  for(const year of school.years||[]){
    const options={school:school.short,mandatory:year.mandatory||[],electives:(year.electives||[]).map(label=>({id:label.toLowerCase().replace(/[^a-z0-9]+/g,'-'),label})),section:null};
    const rows=parseCsv(csv,options);
    if(!rows.length)throw new Error(`No live timetable rows matched ${school.short} ${year.label}`);
    const stats=timetableStats(rows);
    if(stats.classes<1||stats.days<1)throw new Error(`Invalid live timetable stats for ${school.short} ${year.label}`);
    for(const section of year.sections||[]){
      const sectionRows=parseCsv(csv,{...options,section});
      const exact=sectionRows.filter(row=>String(row.section)===String(section));
      if(!exact.length)throw new Error(`Declared section ${school.short} ${year.label} section ${section} has no section-specific live rows`);
      sectionChecks++;
      const sectionStats=timetableStats(sectionRows);
      if(sectionStats.classes<1||sectionStats.days<1)throw new Error(`Invalid live timetable stats for ${school.short} ${year.label} section ${section}`);
      console.log(`${school.short} ${year.label} section ${section}: ${sectionStats.classes} classes across ${sectionStats.days} days`);
    }
    checked++;
    console.log(`${school.short} ${year.label}: ${stats.classes} classes across ${stats.days} days`);
  }
}
if(checked!==CATALOG.schools.reduce((n,s)=>n+(s.years?.length||0),0))throw new Error('Not every catalog year was validated');
console.log(`Live timetable source smoke passed for ${checked} catalog year(s) and ${sectionChecks} declared section(s).`);
