import { useEntities } from "@daveyplate/supabase-swr-entities/client"
import Peer from "peerjs"
import { useEffect, useRef, useState } from "react"
import { v4 } from "uuid"

export const usePeers = ({ enabled = false, onMessage = null }) => {
    const {
        entities: peers,
        createEntity: createPeer,
        updateEntity: updatePeer,
        deleteEntity: deletePeer,
        isLoading: peersLoading
    } = useEntities(enabled && 'peers')

    const [peer, setPeer] = useState(null)
    const connections = useRef([])

    const handleConnection = (conn) => {
        onMessage && conn?.on("data", onMessage)

        conn?.on("open", () => {
            connections.current = connections.current.filter(c => c.peer != conn.peer)
            connections.current.push(conn)
        })

        conn?.on('close', () => {
            connections.current = connections.current.filter(c => c.peer != conn.peer)
        })
    }

    useEffect(() => {
        console.log("connections", connections?.current)
    }, [connections?.current])

    // Clean up the peer on unmount
    useEffect(() => {
        if (!peer?.id) return

        return () => {
            deletePeer(peer.id)
            peer.destroy()
            connections.current = []
        }
    }, [peer])

    useEffect(() => {
        if (!peer?.id || !peers) return

        const keepPeerCurrent = () => {
            const currentPeer = peers.find(p => p.id == peer.id)
            if (currentPeer) {
                console.log("Update Peer Entity")
                updatePeer(currentPeer, { updated_at: new Date() })
            } else {
                console.log("Create a Peer Entity")
                createPeer({ id: peer.id })
            }
        }

        const interval = setInterval(keepPeerCurrent, 60000)

        if (!peers.find(p => p.id == peer.id)) {
            console.log("Create a Peer Entity")
            createPeer({ id: peer.id })
        }

        peer.on("connection", handleConnection)

        peers.forEach(p => {
            if (p.id == peer.id) return
            if (connections.current.some(c => c.peer == p.id)) return

            const conn = peer.connect(p.id)
            handleConnection(conn)
        })

        return () => {
            clearInterval(interval)
            peer.off("connection", handleConnection)
        }
    }, [peers, peer])


    useEffect(() => {
        if (!enabled) return

        // Create a new Peer instance
        const newPeer = new Peer()
        newPeer.on('open', function (id) {
            console.log('My peer ID is: ' + id)
            setPeer(newPeer)
        })

        // newPeer.on('error', console.error)

        return () => {
            newPeer.destroy()
        }
    }, [enabled])

    const send = (data) => {
        connections.current.forEach(c => c.send(data))
    }

    return { peers, send }
}