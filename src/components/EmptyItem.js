import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../controls'

const EmptyItem = props => (
  <div className="row">
    <div className="col-5 mx-auto" style={{ textAlign: 'center' }}>
      <div className="text-muted" style={{ padding: '10px 0 40px 0', fontSize: '20px' }}>
        {props.text || 'Nothing here!'}
      </div>
      {props.link && (
        <Button tag={Link} color="primary" to={props.link}>
          {props.linkText || 'Add'}
        </Button>
      )}
    </div>
  </div>
)

export default EmptyItem
