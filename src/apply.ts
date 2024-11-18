import { writeFileSync } from "fs";
import { GROUP_CONFIG_FILE, PROTOTYPE_GROUPS_CATEGORY } from "./const";
import { addToGroup, createGroup, editGroup, readGroups } from "./groups";
import { synchronise } from "./synchronise";
import * as yaml from "yaml";

async function runWrapper() {
  const results = await synchronise();
  const events = results.events;

  try {
    for (let index = 0; index < events.groupsToCreate.length; index++) {
      const event = events.groupsToCreate[index];
      const group = await createGroup(PROTOTYPE_GROUPS_CATEGORY, event.name);
      event.specification.id = group.id;
    }

    writeFileSync(
      GROUP_CONFIG_FILE,
      yaml.stringify(results.configGroups, {
        collectionStyle: "block",
        defaultStringType: "QUOTE_DOUBLE",
        defaultKeyType: "PLAIN",
      }),
    );

    for (let index = 0; index < events.groupsToUpdate.length; index++) {
      const event = events.groupsToUpdate[index];
      const result = await editGroup(event.group, event.newName);
    }

    for (let index = 0; index < events.membersToAdd.length; index++) {
      const event = events.membersToAdd[index];
      const result = await addToGroup(event.group, event.member.id);
    }
  } catch (err) {
    console.error(`Failed to read actions from file: ${err}`);
    process.exit(1);
  }
}

runWrapper();
