export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',

  MUTATE = 'MUTATE',
  MODERATE = 'MODERATE',

  ACCESS_CONTROL = 'ACCESS_CONTROL',
}

export enum ResourceName {
  BLOG = 'Blog',
  COURSE_QUIZ = 'Course-Quiz',
  COURSE_COMMENTS = 'Course-Comments',
  ALL_COMMENTS = 'All-Comments',
  GLOBAL_ACCESS = 'Global-Access',
  COURSE_ACCESS = 'Course-Access',
  NOTES = 'Notes',
  COURSE_STUDY_BUDDY = 'Course-Study-Buddy',
  ALL_STUDY_BUDDY = 'All-Study-Buddy',
  EXPERIMENTAL = 'Experimental'
}

export enum ComponentType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',

  WILDCARD1 = 'WILDCARD1',
  WILDCARD2 = 'WILDCARD2'
}

export interface ResourceIdComponent {
  name?: string;
  type: ComponentType;
  value? : string;
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
    possibleActions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.MODERATE],
    components: [
      { type: ComponentType.FIXED, value: 'course' },
      { name: 'courseId', type: ComponentType.VARIABLE, value: '' },
      { type: ComponentType.FIXED, value: 'instance' },
      { name: 'instanceId', type: ComponentType.VARIABLE, value: '' },
      { type: ComponentType.FIXED, value: 'comments' },
    ],
  },
  {
    name: ResourceName.ALL_COMMENTS,
    possibleActions: [Action.MODERATE],
    components: [{ type: ComponentType.FIXED, value: "comments" }],
  },
  {
    name : ResourceName.GLOBAL_ACCESS,
    possibleActions : [Action.ACCESS_CONTROL],
    components : [{type : ComponentType.WILDCARD2, value : '**'}]
  }, 
  {
    name : ResourceName.COURSE_ACCESS,
    possibleActions : [Action.ACCESS_CONTROL],
    components : [
      {type : ComponentType.FIXED, value : 'course'},
      {name : 'courseId',type : ComponentType.VARIABLE},
      {type : ComponentType.FIXED, value : 'instance'},
      {name : 'instanceId',type : ComponentType.VARIABLE},
      {type : ComponentType.WILDCARD2, value: '**'}
    ]
  },
  {
    name : ResourceName.NOTES,
    possibleActions : [Action.MUTATE],
    components : [
      {type : ComponentType.FIXED, value : 'course'},
      {name : 'courseId', type : ComponentType.VARIABLE},
      {type : ComponentType.FIXED, value : 'instance'},
      {name : 'instanceId', type : ComponentType.VARIABLE},
      {type : ComponentType.FIXED, value : 'notes'},
    ]
  },
  {
    name : ResourceName.COURSE_STUDY_BUDDY,
    possibleActions : [Action.MODERATE],
    components : [
      {type : ComponentType.FIXED, value : 'course'},
      {name : 'courseId', type : ComponentType.VARIABLE},
      {type : ComponentType.FIXED, value : 'instance'},
      {name : 'instanceId', type : ComponentType.VARIABLE},
      {type : ComponentType.FIXED, value : 'study-buddy'},
    ]
  },
  {
    name : ResourceName.ALL_STUDY_BUDDY,
    possibleActions : [Action.MODERATE],
    components : [{type : ComponentType.FIXED, value : 'study-buddy'}]
  },
  {
    name : ResourceName.EXPERIMENTAL,
    possibleActions : [Action.MUTATE],
    components : [
      {type : ComponentType.FIXED, value : 'exp'}
    ]
  }
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
    }
    else if (component.type == ComponentType.WILDCARD1) {
      return '*';
    }
    else if(component.type == ComponentType.WILDCARD2){
      return '**';
    }
    else {
      return component.value;
    }
  });
  return '/' + components.join('/');
}

export function isValidAction(actionId: Action, resourceName: ResourceName) {
  const resourceType = RESOURCE_TYPE_MAP.get(resourceName);
  if (!resourceType) {
    throw new Error(`Resource type ${resourceName} not found`);
  }
  return resourceType.possibleActions.includes(actionId);
}
