// Public, owner-reviewed display material only. Never populate this from mock
// teams, user profiles, private appointments or user-supplied image URLs.
type Editorial = {
  abbreviation?: string; description?: string; location?: string;
  logo?: `/universities/${string}`; cover?: `/universities/${string}`;
};
// The public names already contain these abbreviations. Do not infer a city,
// institutional biography or official branding from the directory identifier.
const records: Partial<Record<string, Editorial>> = {
  team: {abbreviation:'TEAM'}, tuit: {abbreviation:'TUIT'}, wiut: {abbreviation:'WIUT'},
  mdist: {abbreviation:'MDIST'}, cau: {abbreviation:'CAU'},
};
export function publicEditorial(id:string):Editorial {
  return Object.hasOwn(records,id) ? records[id]??{} : {};
}
