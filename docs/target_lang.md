# Target Language

## Shapes

### @circle

### @rect

### @path

### @polygon

## Transformations

### @color

### @outline

### @rotate

### @repeat

### @scale

### @move

## Animations

### @animate-color

### @animate-rotate

### @animate-move


## Getters, Setters, Grouping

### @copy

### @duplicate

### @define

### @get

### @group




### Grammar Input Examples

```
(*0,0 100,50 50,100** polygon)
```

```
(*0,0 100,50 50,100** polygon 
duplicate 10 10 move 
duplicate 20 20 move 
duplicate 30 30 move)
```

```
(0 0 100 100 rect red color) 
(*100,10 40,198 190,78 10,78 160,198** polygon duplicate 25 25 move duplicate 50 50 move duplicate 75 75 move)
(all 50 50 size duplicate 50 50 move duplicate 0 50 move duplicate 50 0 move)
(all duplicate 50 50 size 25 25 move 90 rotate white color)
(all 50 50 size)
(all duplicate 50 x flip)
(all duplicate 50 y flip)
```
