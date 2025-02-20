import useWindowDimensions from "@/lib/hooks/useWindowDimensionsHook.ts";
import type { Card as CardType } from "@/types";
import {
  type Row,
  createColumnHelper,
  getCoreRowModel,
  getGroupedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";
import { Card } from "./Card";

const columnHelper = createColumnHelper<CardType>();

interface Props {
  cards: CardType[];
  onCardClick?: (cardId: string) => void; // New prop to handle clicks
  cardType: "card" | "row";
}

export function CardsTable({ cards, onCardClick, cardType }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowDimensions();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("image", {
        id: "imageUrl",
      }),
      columnHelper.accessor("card_id", {
        id: "card_id",
      }),
      columnHelper.accessor("name", {
        id: "name",
      }),
      columnHelper.accessor("set_details", {
        id: "set_details",
      }),
    ];
  }, []);

  // Columns and data are defined in a stable reference, will not cause infinite loop!
  const table = useReactTable({
    columns,
    data: cards,
    enableGrouping: true,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    initialState: {
      grouping: ["set_details"],
    },
  });
  const groupedRows = useMemo(
    () => table.getGroupedRowModel().rows,
    [table.getGroupedRowModel().rows]
  ); // Get grouped rows from the table model

  let cardsPerRow = 5;
  let cardHeight = Math.min(width, 890) / 5 + 120;
  if (width > 600 && width < 800) {
    cardsPerRow = 4;
    cardHeight = width / 3 + 50;
  } else if (width <= 600) {
    cardsPerRow = 3;
    cardHeight = width / 3 + 100;
  }

  const groupedGridRows = useMemo(
    () =>
      groupedRows.map((groupRow) => {
        const header = { type: "header", row: groupRow };
        const dataRows = groupRow.subRows.map((subRow) => ({
          type: "data",
          row: subRow,
        }));

        const gridRows = [];
        for (let i = 0; i < dataRows.length; i += cardsPerRow) {
          gridRows.push(dataRows.slice(i, i + cardsPerRow));
        }

        return { header, gridRows };
      }),
    [groupedRows, cardsPerRow]
  );

  const flattenedRows = useMemo(
    () =>
      groupedGridRows.flatMap((group) => [
        { type: "header", height: 60, data: group.header }, // Group header
        ...group.gridRows.map((gridRow) => ({
          type: "gridRow",
          height: cardHeight,
          data: gridRow,
        })), // Grid rows
      ]),
    [groupedGridRows]
  );

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: flattenedRows.length,
    estimateSize: (index) =>
      (flattenedRows[index].type === "header" ? 60 : cardHeight) + 12,
    overscan: 5,
  });


  return (
    <div
      ref={parentRef}
      className="h-fill overflow-y-auto mt-4 sm:mt-8 px-4"
      style={{ scrollbarWidth: "none" }}
    >
      <div
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        className="relative w-full"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = flattenedRows[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={
                cardType === "row"
                  ? {}
                  : {
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }
              }
              className={
                cardType === "row"
                  ? "w-full h-fit"
                  : "absolute top-0 left-0 w-full"
              }
            >
              {row.type === "header" ? (
                <>
                  <h2 className="mx-auto mt-10 text-center w-full max-w-[900px] scroll-m-20 border-b-2 border-slate-600 pb-2 font-semibold text-md sm:text-lg md:text-2xl tracking-tight transition-colors first:mt-0">
                    {(
                      row.data as { type: string; row: Row<CardType> }
                    ).row.getValue("set_details")}
                  </h2>
                  {cardType === "row" && (
                    <div className="grid grid-cols-3 gap-x-3 w-full items-center font-bold text-xl border-b-2 border-slate-600/25 pb-2">
                      <h1 className="col-span-1">Name</h1>
                      <h2 className="col-span-1 text-center">Rarity</h2>
                      <h2 className="col-span-1 text-right">Count</h2>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={
                    cardType === "row"
                      ? "flex justify-center flex-col w-full"
                      : "flex justify-center gap-x-3"
                  }
                >
                  {(row.data as { type: string; row: Row<CardType> }[]).map(
                    ({ row: subRow }) => (
                      <Card
                        key={subRow.original.card_id}
                        card={subRow.original}
                        onClick={() => onCardClick?.(subRow.original.card_id)}
                        type={cardType}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
