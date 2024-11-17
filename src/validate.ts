import { writeMarkdown } from "./event";
import { synchronise } from "./synchronise";

async function runWrapper() {
  const results = await synchronise();
  const events = results.events;

  // Write a summary of the changes as markdown, if there are any changes.
  if (
    events.groupsToCreate.length > 0 ||
    events.groupsToUpdate.length > 0 ||
    events.membersToAdd.length > 0 ||
    events.membersToRemove.length > 0
  ) {
    writeMarkdown(events);
  }
}

runWrapper();
