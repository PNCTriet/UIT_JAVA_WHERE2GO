const { count } = require('console')
const data = require('./location_offline/location.json')

const { features: tempwards} = data

const getBbox = polygons =>{
    let bbox = {
        minlat : 100000,
        maxlat : -100000,
        minlong: 100000,
        maxlong: -100000
    }
    polygons.forEach(polygon => {
            polygon.forEach(point => {
                const [long,lat] = point
                bbox.minlat = Math.min(bbox.minlat, lat)
                bbox.maxlat = Math.max(bbox.maxlat, lat)
                bbox.minlong = Math.min(bbox.minlong, long)
                bbox.maxlong = Math.max(bbox.maxlong, long)
            })
        })
    return bbox;
}
const wards = tempwards.map(ward => {
    let wardData = {
        type : ward.properties.TYPE_3,
        name : ward.properties.NAME_3,
        district : ward.properties.NAME_2,
        province: ward.properties.NAME_1,
    }
    if(ward.geometry.type =='Polygon'){
        wardData.polygons = ward.geometry.coordinates
    }
    else{
        wardData.polygons = ward.geometry.coordinates.map(polygon =>{
            return polygon[0]
        })
    }
    //lay bbox
    wardData.bbox = getBbox(wardData.polygons)
    return wardData
})

const fs = require('fs');
fs.writeFileSync('data.json',JSON.stringify(wards))

const lineIntersectSegment = () =>{
    const [lineStart, lineEnd] = line
    const [segmentStart, segmentEnd] = segment
    const a = (lineEnd.lat - lineStart.lat) / (lineEnd.long - lineStart.long)
    const b = lineEnd.lat - (a*lineEnd.long)

    const startPointAbove = segmentStart.lat > a * segmentStart.long + b;
    const endPointAbove = segmentEnd.lat > a * segmentEnd.long + b;

    return startPointAbove != endPointAbove
}

const segmentIntersect = (segment1, segment2) => {
    return lineIntersectSegment(segment1, segment2) &&
            lineIntersectSegment(segment2, segment1)
}


const positionInsidePolygon = (position, polygon) => {
    const checkSegment = [
        {lat: 0, long:0},
        position
    ]
    for(let i = 0; i < polygon.length - 1; i++){
        const segment = [
            polygon[i],
            polygon[i + 1]
        ]
        if (segmentIntersect(checkSegment, segment)){
            count++
        }
    }

    return count % 2 != 0
}

const positionInsideBbox = ( position, bbox) => {
    return position.lat >= bbox.minlat &&
            position.lat <= bbox.maxlat &&
            position.long >= bbox.minlong &&
            position.long <= bbox.maxlong
}