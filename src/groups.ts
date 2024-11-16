import fetch from "node-fetch";
import { makeCanvasRequest } from "./canvas";
import * as fs from "fs";
import { StudentsByCanvasId } from "./students";
import { GROUP_CONFIG_FILE } from "./const";

/**
 * Represents information about a group that is shared between
 * our local configuration and Canvas.
 */
export interface BaseGroup {
  id?: number;
  name: string;
}

/**
 * Represents information about a group returned by Canvas.
 */
export interface CanvasGroup extends BaseGroup {
  id: number;
  join_level: "parent_context_auto_join";
  group_category_id: number;
  members_count: number;
  context_type: string;
  course_id: number;
  role: string;
}

/** Represents information about a group stored in our configuration file. */
export interface GroupSpecification extends BaseGroup {
  // An array of SIS User IDs.
  members: string[];
}

/** Represents a mapping of groups by group category. */
export interface GroupsByCategory<T extends BaseGroup> {
  [index: number]: GroupsById<T>;
}

/** Represents a mapping of groups to their IDs. */
export interface GroupsById<T extends BaseGroup> {
  [index: number]: T;
}

/** Reads the local group configuration file. */
export async function readGroups(): Promise<GroupSpecification[]> {
  const groups: GroupSpecification[] = JSON.parse(
    fs.readFileSync(GROUP_CONFIG_FILE, "utf-8")
  );

  return groups;
}

/**
 * Fetches the groups for the specified course from Canvas.
 *
 * @param course The ID of the course to fetch groups for.
 * @returns Returns the groups, organised by group category.
 */
export async function getCourseGroups(
  course: number
): Promise<GroupsByCategory<CanvasGroup>> {
  const request = makeCanvasRequest(`/courses/${course}/groups?per_page=200`);
  const response = await fetch(request);
  if (response.status == 200) {
    const groups: CanvasGroup[] = await response.json();
    const result: GroupsByCategory<CanvasGroup> = {};

    groups.forEach((group) => {
      if (result[group.group_category_id] === undefined) {
        result[group.group_category_id] = {};
      }

      result[group.group_category_id][group.id] = group;
    });

    return result;
  } else {
    throw response.statusText;
  }
}

/**
 * Fetches the members of the group with the specified ID.
 *
 * @param id The ID of the group to fetch members for.
 * @returns Returns the members of the specified group, organised by Canvas ID.
 */
export async function getGroupMembers(id: number): Promise<StudentsByCanvasId> {
  const request = makeCanvasRequest(`/groups/${id}/users`);
  const response: any[] = await (await fetch(request)).json();
  const result: StudentsByCanvasId = {};

  response.forEach((member) => {
    result[member.id] = member;
  });

  return result;
}

