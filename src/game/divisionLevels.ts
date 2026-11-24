import type { Level } from "./types";

export const shareRanges:Record<Level,{plates:[number,number];per:[number,number]}>={
  1:{plates:[2,2],per:[2,5]}, 2:{plates:[2,3],per:[2,5]}, 3:{plates:[3,4],per:[2,5]},
  4:{plates:[2,5],per:[3,6]}, 5:{plates:[3,6],per:[4,8]},
};
export const divisionDivisors:Record<Level,number[]>={
  1:[2,10],2:[2,5,10],3:[3,4],4:[6,7,8,9],5:[2,3,4,5,6,7,8,9,10],
};
export const maxQuotient=(level:Level)=>level===1?5:10;
export function divisionLevel(share:boolean,divisor:number,quotient:number) {
  if(!Number.isInteger(divisor)||!Number.isInteger(quotient))return undefined;
  return ([1,2,3,4,5] as const).find(level=>{
    if(!share)return divisionDivisors[level].includes(divisor) && quotient>=1 && quotient<=maxQuotient(level);
    const {plates,per}=shareRanges[level];
    return divisor>=plates[0] && divisor<=plates[1] && quotient>=per[0] && quotient<=per[1];
  });
}
