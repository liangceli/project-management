"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import { useSearchQuery } from "@/state/api";
import { debounce } from "lodash"; // debounce 是一种常用的前端性能优化技术，主要用于控制某个函数的高频调用，使它只在最后一次调用后过了一段时间才执行一次。
import React, { useEffect, useState } from "react";

const Search = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });
  
// 情景例子
//   👤 用户打开 “商品搜索” 页。

// 🧑‍💻 用户在搜索框里快速打字：输入了 "iPhone"。

// handleSearch 每次都被触发，但由于防抖机制，只有在用户停止输入 500ms 后才会执行 setSearchTerm()。

// 用户还没等 500ms 到达，就点击了导航栏切换到了 “购物车” 页。

// React 卸载了 “搜索” 页组件，这时 useEffect 中注册的 handleSearch.cancel() 被调用。

// ✅ 未完成的 setSearchTerm() 调用被取消了！也就不会更新 state，不会发起搜索请求。

// 🎉 避免了“组件卸载后 setState 报错”或“用户已经不在搜索页了却还发送了请求”的问题！

// 使用 lodash 的 debounce 创建一个防抖函数 handleSearch
// 它会在用户停止输入 500ms 后才执行 setSearchTerm，减少不必要的频繁更新
const handleSearch = debounce(
  (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value); // 设置搜索关键词的状态
  },
  500, // 防抖延迟时间为 500 毫秒
);

// 使用 useEffect 进行副作用清理
useEffect(() => {
  // useEffect 的返回值会在组件卸载时自动执行
  // 这里返回 handleSearch.cancel 是为了在组件卸载或依赖变更时
  // 主动取消未执行的防抖函数，防止内存泄漏或组件卸载后还执行 setState 的问题
  return handleSearch.cancel;
}, [handleSearch.cancel]); // 当 handleSearch.cancel 改变时重新设置清理函数


return (
  <div className="p-8">
    <Header name="Search" />
    <div>
      <input
        type="text"
        placeholder="Search..."
        className="w-1/2 rounded border p-3 shadow"
        onChange={handleSearch}
      />
    </div>
    <div className="p-5">
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error occurred while fetching search results.</p>}
      {!isLoading && !isError && searchResults && (
        <div>
          {searchResults.tasks && searchResults.tasks?.length > 0 && (
            <h2>Tasks</h2>
          )}
          {searchResults.tasks?.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {searchResults.projects && searchResults.projects?.length > 0 && (
            <h2>Projects</h2>
          )}
          {searchResults.projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}

          {searchResults.users && searchResults.users?.length > 0 && (
            <h2>Users</h2>
          )}
          {searchResults.users?.map((user) => (
            <UserCard key={user.userId} user={user} />
          ))}
        </div>
      )}
    </div>
  </div>
);
};

export default Search;