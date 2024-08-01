export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',

  MUTATE = 'MUTATE',
}

export enum ResourceName {
  BLOG = 'Blog',
  COURSE_QUIZ = 'Course Quiz',
  COURSE_COMMENTS = 'Course comments',
}

export enum ComponentType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
}

export interface ResourceIdComponent {
  name?: string;
  type: ComponentType;
  value: string;
}

export interface ResourceType {
  name: ResourceName;
  possibleActions: Action[];
  components: ResourceIdComponent[];
}

export const ALL_RESOURCE_TYPES: ResourceType[] = [
  {
    name: ResourceName.BLOG,
    possibleActions: [Action.MUTATE],
    components: [{ type: ComponentType.FIXED, value: 'blog' }],
  },
  {
    name: ResourceName.COURSE_QUIZ,
    possibleActions: [Action.MUTATE],
    components: [
      { type: ComponentType.FIXED, value: 'course' },
      { name: 'courseId', type: ComponentType.VARIABLE, value: '' },
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: '' },
      { type: ComponentType.FIXED, value: 'quiz' },
    ],
  },
  {
    name: ResourceName.COURSE_COMMENTS,
    possibleActions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    components: [
      { type: ComponentType.FIXED, value: 'course' },
      { name: 'courseId', type: ComponentType.VARIABLE, value: '' },
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: '' },
      { type: ComponentType.FIXED, value: 'comments' },
    ],
  },
];

export const RESOURCE_TYPE_MAP = new Map<ResourceName, ResourceType>(
  ALL_RESOURCE_TYPES.map((resourceType) => [resourceType.name, resourceType])
);
export function getResourceId(resourceName: ResourceName, variables: Record<string, string>) {
  const resourceType = RESOURCE_TYPE_MAP.get(resourceName);
  if (!resourceType) {
    throw new Error(`Resource type ${resourceName} not found`);
  }
  const components = resourceType.components.map((component) => {
    if (component.type == ComponentType.VARIABLE) {
      const value = variables[component.name!];
      if (!value) {
        throw new Error(`Variable ${component.name} is required but not provided`);
      }
      return value;
    } else {
      return component.value;
    }
  });
  return '/' + components.join('/');
}
