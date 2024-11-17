import { writeFileSync } from "fs";
import { MARKDOWN_OUTPUT } from "./const";
import { StudentIDs } from "./students";

export enum EventType {
  CREATE_GROUP,
  UPDATE_GROUP,
  REMOVE_GROUP_MEMBER,
  ADD_GROUP_MEMBER,
}

export interface Event {
  type: EventType;
}

export interface CreateGroupEvent {
  name: string;
  members: StudentIDs[];
}

export interface UpdateGroupEvent {
  group: number;
  oldName: string;
  newName: string;
}

export interface RemoveGroupMemberEvent {
  group: number;
  member: StudentIDs;
}

export interface AddGroupMemberEvent {
  group: number;
  member: StudentIDs;
}

export interface Events {
  groupsToCreate: CreateGroupEvent[];
  groupsToUpdate: UpdateGroupEvent[];
  membersToRemove: RemoveGroupMemberEvent[];
  membersToAdd: AddGroupMemberEvent[];
}

export function makeEmptyActions(): Events {
  return {
    groupsToCreate: [],
    groupsToUpdate: [],
    membersToRemove: [],
    membersToAdd: [],
  };
}

const mdInlineCode = (str: string): string => `\`${str}\``;

export function writeMarkdown(actions: Events) {
  let output: string =
    "The changes made to the configuration file will result in the following actions.\n\n";

  if (actions.groupsToCreate.length > 0) {
    output += "## Groups to create\n\n";

    actions.groupsToCreate.forEach((group) => {
      output += `- A group named \`${group.name}\` with members: ${group.members
        .map((member) => mdInlineCode(member.sis_user_id))
        .join(", ")}`;
    });
  }

  if (actions.groupsToUpdate.length > 0) {
    output += "## Groups to update\n\n";

    actions.groupsToUpdate.forEach((group) => {
      output += `- A group named ${mdInlineCode(group.oldName)} (${
        group.group
      }) will be renamed to ${mdInlineCode(group.newName)}`;
    });
  }

  if (actions.membersToRemove.length > 0) {
    output += "## Students to remove from groups\n\n";

    actions.membersToRemove.forEach((member) => {
      output += `- Remove student ${mdInlineCode(
        member.member.sis_user_id
      )} from group ${mdInlineCode(member.group.toString())}`;
    });
  }

  if (actions.membersToAdd.length > 0) {
    output += "## Students to add to groups\n\n";

    actions.membersToAdd.forEach((member) => {
      output += `- Add student ${mdInlineCode(
        member.member.sis_user_id
      )} to group ${mdInlineCode(member.group.toString())}`;
    });
  }

  writeFileSync(MARKDOWN_OUTPUT, output);
}
