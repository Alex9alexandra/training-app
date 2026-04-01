import React,{useState} from "react"

import "./WorkoutList.css"

type Workout={
    id:number;
    name:string;
}

type WorkoutListParam={
    workouts:Workout[];
    onSelect:(id:number)=>void;
};

const WorkoutList: React.FC<WorkoutListParam>=({workouts,onSelect})=>{
    const[currentPage,setCurrentPage]=useState(1);
    const[selectedId,setSelectedId]=useState<number |null>(null);
    const itemsPerPage=5;
    const startIndex=(currentPage-1)*itemsPerPage;
    const totalPages=Math.ceil(workouts.length/itemsPerPage);
    const currentItems=workouts.slice(startIndex,startIndex+itemsPerPage)

    const handleClick=(id:number)=>{
        setSelectedId(id);
        onSelect(id);
    }
    return(
        <div className="workout-list">
            <ul>
                {currentItems.map((workout)=>(
                    <li key={workout.id}
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
                onClick={() => setCurrentPage(currentPage - 1)}
                >
                Prev
                </button>

                <span>
                {currentPage}/{totalPages}
                </span>

                <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                >
                Next
                </button>
            </div>
        </div>
    );
};

export default WorkoutList;