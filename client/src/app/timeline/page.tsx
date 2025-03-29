"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { useGetProjectsQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";

type taskTypeItems = "task" | "milestone" | "project";

type Props = {}

const Timeline = (props: Props) => {
    
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
    const { data: projects, isLoading, isError} = useGetProjectsQuery();
    const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
        viewMode: ViewMode.Month, // 你可以在组件中用它来控制甘特图显示的是“日”、“周”、“月”等视图（ViewMode），或者控制语言/地区格式（locale）比如日期格式是美式（"en-US"）还是其他格式。
        locale: "en-US",
    });

    const ganttTasks = useMemo(() => { // useMemo 是 React 的一个性能优化钩子，用来缓存计算结果。只有当 projects 发生变化时，才会重新执行 map() 生成新的任务数组；否则会复用上一次计算出来的值，避免不必要的重新渲染。
        return (
            projects?.map((project) => (
                {
                    start: new Date(project.startDate as string),
                    end: new Date(project.endDate as string),
                    name: project.name,
                    id:  `Project-${project.id}`,
                    type: "project" as taskTypeItems,
                    progress: 50,
                    isDisable: false,
                }
            )) || [] // 如果 projects 是 undefined 或 null，则返回空数组
        );
    }, [projects]);

    const handleViewModeChange = (
           event: React.ChangeEvent<HTMLSelectElement>, //event 是一个下拉框（<select>）变化时触发的事件。
                                                        // event.target.value 就是用户选中的值，比如 "Day"、"Week" 或 "Month"
      ) => {
        setDisplayOptions((prev) => ({
          ...prev, // 这表示我们保留原来的状态值（比如 locale: "en-US"），只更新 viewMode。
          viewMode: event.target.value as ViewMode, // prev 代表之前的 displayOptions 值（比如 { viewMode: "Month", locale: "en-US" }）使用 as ViewMode 强制把选中的值转换成你定义好的 ViewMode 枚举类型
        }));
      };

    if (isLoading) return <div>Loading...</div>
    if (isError || !projects)
        return <div>An error occurred while fetching data</div> 
  return (
    <div className="max-w-full p-8">
        <header className="mb-4 flex items-center justify-between">
            <Header name="Projects Timeline"/>
            <div className="relative inline-block w-64">
                <select
                    className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none"
                    value={displayOptions.viewMode}
                    onChange={handleViewModeChange}
                >
                    <option value={ViewMode.Day}>Day</option>
                    <option value={ViewMode.Week}>Week</option>
                    <option value={ViewMode.Month}>Month</option>
                </select>
            </div>
        </header>

        <div className="overflow-hidden rounded-md bg-white shadow ">
        <div className="timeline">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="100px"
            projectBackgroundColor={isDarkMode ? "#101214" : "#1f2937"}
            projectProgressColor={isDarkMode ? "#1f2937" : "#aeb8c2"}
            projectProgressSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        </div>
      </div>
    </div>
  )
}

export default Timeline