import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export interface Project {
    id: number;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

export enum Status {
    ToDo = "To Do",
    WorkInProgress = "Work In Progress",
    UnderReview = "Under Review",
    Completed = "Completed",
}


export enum Priority {
    Urgent = "Urgent",
    High = "High",
    Medium = "Medium",
    Low = "Low",
    Backlog = "Backlog",
}

export interface User {
    userId?: number;
    username: string;
    email: string;
    profilePictureUrl?: string;
    cognitoId?: string;
    teamId?: number;
  }

export interface Attachment {
    id: number;
    fileURL: string;
    fileName: string;
    taskId: number;
    uploadedById: number;
}

export interface Task {
      id: number;
      title?: string;
      description?: string;
      status?: Status;
      priority?: Priority;
      tags?: string;
      startDate?: string;
      dueDate?: string;
      points?: number;
      projectId?: number;
      authorUserId?: number;
      assignedUserId?: number;

      author?: User,
      assignee?: User,
      comments?: Comment[],
      attachments?: Attachment[],
}

export interface SearchResults {
    tasks?: Task[];
    projects?: Project[];
    users?: User[];
}

export interface Team {
    teamId: number;
    teamName: string;
    productOwnerUserId?: number;
    projectManagerUserId?: number;
}
// api 变量存储 API slice，稍后会被用于 store.ts 里注册到 Redux。
export const api = createApi({
    baseQuery: fetchBaseQuery({baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        prepareHeaders: async (headers) => { // 这是关键配置，用于给每个请求自动加 Header。它会在每次发请求前自动执行。
            const session = await fetchAuthSession(); // 从 Amplify 中获取当前登录用户的 session（包含 Token)
            const { accessToken } = session.tokens ?? {}; // 从 session 中提取 accessToken（JWT 令牌）
            if (accessToken) { // 如果有 token，就在请求头中加上：
                               // Authorization: Bearer eyJraWQiOiJ...
              headers.set("Authorization", `Bearer ${accessToken}`);
            }
            return headers; // 最后一定要返回 headers，否则请求不会带上这些自定义的 Header
          },
    }),
    reducerPath: "api", // reducerPath 设定 Redux store 中 API slice 的命名空间，这里是 "api"。
    tagTypes: ["Projects", "Tasks", "Users", "Teams"],
    endpoints: (build) => ({
        getAuthUser: build.query({
            queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
              try {
                const user = await getCurrentUser(); // 获取当前登录的用户对象 返回当前已登录的 Cognito 用户的基础信息，比如用户名、邮箱等。
                                                     // 不包含 token 或 session，只是一些公共属性。
                const session = await fetchAuthSession(); // 获取当前用户的认证会话信息 包含当前用户的 token、userSub（Cognito ID）用于校验用户身份
                if (!session) throw new Error("No session found");
                const { userSub } = session; // cognito id
                const { accessToken } = session.tokens ?? {};
      
                const userDetailsResponse = await fetchWithBQ(`users/${userSub}`); // 对应这里（传进来的是cognito id）： router.get("/:cognitoId", getUser); 向后端请求当前Cognito用户的详细信息 根据cognito ID查询
                const userDetails = userDetailsResponse.data as User; // 它是把 userDetailsResponse.data 强制认为是一个符合 User 类型的对象。将返回的用户信息强制视为符合你定义的 User 类型，方便类型安全地使用字段

                // 用户登录，获取 Cognito Session（含 userSub）

                // 前端调用：GET /users/<userSub> 👉

                // 后端使用 getUser(req.params.cognitoId) 从数据库查出用户详细信息

                // 前端拿到完整用户数据，保存在 userDetails
                return { data: { user, userSub, userDetails } };
              } catch (error: any) {
                return { error: error.message || "Could not fetch user data" };
              }
            },
          }),

        getProjects: build.query<Project[], void>({
            query: () => "projects",
            providesTags: ["Projects"],
        }),

        createProject: build.mutation<Project,Partial<Project>>({
            query: (project) => ({
                url:"projects",
                method: "POST",
                body: project,
            }),
            invalidatesTags: ["Projects"], // invalidatesTags是数据更新
        }),

        getTasks: build.query<Task[], {projectId:number}>({
            
            query: ({projectId}) => `tasks?projectId=${projectId}`, // 页面 URL ≠ 数据请求 URL
            providesTags: (result) => // providesTags 让 Redux 知道这个查询数据属于 Tasks 类型，以便在 数据更新时（如 invalidateTags）可以自动触发重新请求。
                result
                    ? result.map(({id}) => ({type: "Tasks" as const, id}))
                    : [{type: "Tasks" as const}],

        }),

        getTasksByUser: build.query<Task[],number>({
            query: (userId) => `tasks/user/${userId}`,
            providesTags: (result, error, userId) =>
                result // 如果有查询结果（result 不为空）
                    ? result.map(({id}) => ({type: "Tasks", id})) // 遍历每一个任务（id），返回多个缓存标记：{ type: "Tasks", id }
                    : [{type: "Tasks", id: userId}], // 如果查询失败（result 是 null 或 undefined）：用整个用户的任务作为一个统一缓存
        }),

        createTask: build.mutation<Task, Partial<Task>>({
            query: (task) => ({
                url:"tasks",
                method: "POST",
                body: task,
            }),
            invalidatesTags: ["Tasks"],
        }),

        updateTaskStatus: build.mutation<Task, {taskId: number; status: string}>({ // 参数中的第一个Task是返回值 表示更新后的任务 参数：{ taskId: number; status: string }，需要提供任务 ID 和新的状态。
            query: ({taskId, status}) => ({ // 发送 PATCH 请求到 tasks/{taskId}/status，请求体中包含 { status }
                url:`tasks/${taskId}/status`,
                method: "PATCH",
                body: {status},
            }),
            invalidatesTags: (result, error, {taskId}) => [ //更新任务后，触发 taskId 对应的数据 自动重新获取。 Redux 会缓存数据，如果不手动通知它数据已变更，组件中的任务状态不会更新。
                {type: "Tasks", id: taskId}
            ],
        }),
        getUsers: build.query<User[],void>({
            query: () => "users",
            providesTags: ["Users"],
        }),
        getTeams: build.query<Team[], void>({
            query: () => "teams",
            providesTags: ["Teams"],
        }),
        search: build.query<SearchResults, string>({
            query: (query) => `search?query=${query}`,
        }),
    }), // endpoints 定义具体的 API 请求方法（如 GET、POST、PUT、DELETE）
})

export const {useGetProjectsQuery, 
              useCreateProjectMutation, 
              useGetTasksQuery, 
              useCreateTaskMutation,
              useUpdateTaskStatusMutation,
              useSearchQuery,
              useGetUsersQuery,
              useGetTeamsQuery,
              useGetTasksByUserQuery,
              useGetAuthUserQuery,
            } = api;