import { describeObject, type World } from '../../logic'
import { shapeGlyph, shapeName, sizeClass } from './worldDisplay'

export function WorldBoard({ world }: { world: World }) {
  return (
    <>
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${world.width}, minmax(54px, 1fr))`,
          gridTemplateRows: `repeat(${world.height}, minmax(54px, 1fr))`,
        }}
      >
        {Array.from({ length: world.width * world.height }).map((_, index) => {
          const x = index % world.width
          const y = Math.floor(index / world.width)
          const object = world.objects.find((item) => item.x === x && item.y === y)

          return (
            <div className="cell" key={`${x}-${y}`}>
              <span className="coord">{x},{y}</span>
              {object ? (
                <div className={sizeClass(object)} title={describeObject(object)}>
                  <span className="piece-id">{object.id}</span>
                  <span className="piece-shape">{shapeGlyph(object)}</span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="object-list">
        {world.objects.map((object) => (
          <div className="object-row" key={object.id}>
            <span className={sizeClass(object)}>{shapeGlyph(object)}</span>
            <div>
              <strong>{object.id}</strong>
              <small>{shapeName(object)} · {object.size} · ({object.x}, {object.y})</small>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
