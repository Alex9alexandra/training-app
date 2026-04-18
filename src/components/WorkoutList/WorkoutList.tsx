import React,{useState} from "react"

import "./WorkoutList.css"

type Workout={
    id:number;
    name:string;
}

type WorkoutListParam={
    workouts:{
        data: Workout[];
        totalPages:number;
    };
    page:number;
    onSelect:(id:number)=>void;
    onPageChange:(page:number)=>void;
};

const WorkoutList: React.FC<WorkoutListParam>=({workouts,page,onSelect,onPageChange})=>{
    const currentPage=page;
    const[selectedId,setSelectedId]=useState<number |null>(null);
    
    const totalPages=workouts.totalPages;
    const currentItems=workouts.data;
    
    const handleClick=(id:number)=>{
        setSelectedId(id);
        onSelect(id);
    }

    return(
        <div className="workout-list">
            <ul>
                {currentItems.map((workout)=>(
                    <li 
                    key={workout.id}
                    className={selectedId===workout.id?"selected":""}
                    onClick={()=>handleClick(workout.id)}
                    >
                        {workout.name}
                    </li>
                ))}
            </ul>
            
            <div className="list-pagination">
                <button
                disabled={currentPage === 1}
                onClick={() =>
                onPageChange(currentPage - 1)
                }
                >
                Prev
                </button>

                <span>
                {currentPage}/{totalPages}
                </span>

                <button
                disabled={currentPage === totalPages}
                onClick={() =>
                onPageChange(currentPage + 1)
                }
                >
                Next
                </button>
            </div>
        </div>
    );
};

export default WorkoutList;