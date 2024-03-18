import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import Geolocation from '@react-native-community/geolocation';

const wards = require('./data.json')


const lineIntersectSegment = (line, segment) =>{
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

    let count = 0

    for(let i = 0; i < polygon.length - 1; i++){
        const segment = [
            { long: polygon[i][0], lat: polygon[i][1]},
            { long: polygon[i + 1][0], lat: polygon[i+1][1]}
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

const positionInsideWard = (position, ward) => {
    // if (positionInsideBbox(position, ward.bbox)) 
    return ward.polygons.some(polygon => {
        return positionInsidePolygon(position, polygon)
    })
}


const app = () => {
    const [ward, setWard] = useState(null)

    const getWard = (position) => {
        let posibleWards = wards.filter(ward => positionInsideBbox(position, ward.bbox))
        // console.log(posibleWards);

        if (posibleWards.length ==1){
            setWard(posibleWards[0])
            return;
        }
        let findward = posibleWards.find(posibleWards => positionInsideWard(position,  posibleWards));
        setWard(findward)   
    }



    useEffect(() => {
        console.log('hello hi');
        Geolocation.getCurrentPosition(
            location => {
                const { latitude, longitude } = location.coords
                getWard({
                    lat: latitude,
                    long: longitude
                })
            },
            e => console.log(e),
            {
                timeout: 10000,
                maximumAge: 10000,
                enableHighAccuracy: true,
            }
        );
        // const posibleWards = wards.map(map =>)
    }, [])
    return (
        <View>
            {   ward &&
                <Text>
                    {ward.type+' '+ward.name+' '+ward.district+' '+ward.province}
                </Text>
            }
        </View>
    )
}

export default app