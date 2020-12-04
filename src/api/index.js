import request from './request'

export function sendAttestation(data) {
    return request({
        url: '/api/v1/attestation',
        method: 'POST',
        data
    })
}