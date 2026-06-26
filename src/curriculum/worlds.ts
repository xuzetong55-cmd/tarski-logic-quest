import type { World } from '../logic'

export const starterWorld: World = {
  width: 5,
  height: 4,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 0 },
    { id: 'B', shape: 'tet', size: 'medium', x: 1, y: 0 },
    { id: 'C', shape: 'dodec', size: 'large', x: 2, y: 0 },
    { id: 'D', shape: 'cube', size: 'large', x: 4, y: 1 },
  ],
}

export const quantifierWorld: World = {
  width: 5,
  height: 4,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 0 },
    { id: 'B', shape: 'cube', size: 'medium', x: 1, y: 1 },
    { id: 'C', shape: 'tet', size: 'small', x: 3, y: 1 },
    { id: 'D', shape: 'dodec', size: 'large', x: 4, y: 2 },
    { id: 'E', shape: 'tet', size: 'large', x: 2, y: 3 },
  ],
}

export const proofWorld: World = {
  width: 5,
  height: 5,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 0 },
    { id: 'B', shape: 'tet', size: 'medium', x: 1, y: 1 },
    { id: 'C', shape: 'dodec', size: 'large', x: 2, y: 2 },
    { id: 'D', shape: 'cube', size: 'medium', x: 4, y: 2 },
    { id: 'E', shape: 'tet', size: 'small', x: 3, y: 4 },
  ],
}

export const allCubeWorld: World = {
  width: 4,
  height: 3,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 0 },
    { id: 'B', shape: 'cube', size: 'medium', x: 1, y: 1 },
    { id: 'C', shape: 'cube', size: 'large', x: 3, y: 2 },
  ],
}

export const mixedWorld: World = {
  width: 4,
  height: 3,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 0 },
    { id: 'B', shape: 'tet', size: 'medium', x: 1, y: 1 },
    { id: 'C', shape: 'dodec', size: 'large', x: 3, y: 2 },
  ],
}

export const oneSmallCubeWorld: World = {
  width: 4,
  height: 3,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 1 },
    { id: 'B', shape: 'tet', size: 'large', x: 2, y: 1 },
  ],
}

export const emptyOfCubesWorld: World = {
  width: 4,
  height: 3,
  objects: [
    { id: 'A', shape: 'tet', size: 'small', x: 0, y: 0 },
    { id: 'B', shape: 'dodec', size: 'large', x: 2, y: 2 },
  ],
}

export const lineWorld: World = {
  width: 5,
  height: 3,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 1 },
    { id: 'B', shape: 'tet', size: 'medium', x: 2, y: 1 },
    { id: 'C', shape: 'dodec', size: 'large', x: 4, y: 1 },
  ],
}

export const diagonalWorld: World = {
  width: 5,
  height: 5,
  objects: [
    { id: 'A', shape: 'cube', size: 'small', x: 0, y: 0 },
    { id: 'B', shape: 'tet', size: 'medium', x: 2, y: 2 },
    { id: 'C', shape: 'dodec', size: 'large', x: 4, y: 4 },
  ],
}
