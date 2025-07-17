# Tile Rotation Utilities

These helpers control the orientation and placement of tiles based on player seat and calling position.

- `rotationForSeat(seat: number)` returns the base rotation in degrees for the given seat.
- `calledRotation(seat: number, from: number)` adjusts the rotation when claiming a tile from another player's discard.
- `calledOffset(seat: number)` is defined in `RiverView.tsx` and offsets the called tile slightly so it appears tucked into the meld.

Combining these allows the discard and meld areas to mimic real table layouts. When extending the layout, adjust these functions to reposition or rotate tiles consistently.
